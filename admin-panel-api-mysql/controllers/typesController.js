const { runDBCommand } = require("../config/db");

exports.getComplaintTypes = async (req, res) => {
  const query = `SELECT complaint_type_id, type_name, description FROM  complaint_type ORDER BY complaint_type_id`;
  try {
    const types = await runDBCommand(query);
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch  complaint types" });
  }
};

exports.getComplaintTypeById = async (req, res) => {
  const id = req.params.id;
  const query = `SELECT complaint_type_id, type_name, description FROM  complaint_type WHERE complaint_type_id = ?`;
  try {
    const result = await runDBCommand(query, [id]);
    if (result.length === 0)
      return res.status(404).json({ error: "Type not found" });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch type" });
  }
};

exports.createComplaintType = async (req, res) => {
  const { type_name, description } = req.body;
  if (!type_name) return res.status(400).json({ error: "Name is required" });

  const query = `INSERT INTO  complaint_type (type_name, description) VALUES (?, ?)`;
  try {
    await runDBCommand(query, [type_name, description]);
    res.json({ message: "Created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Creation failed", details: err.message });
  }
};

exports.updateComplaintType = async (req, res) => {
  const id = req.params.id;
  const { type_name, description } = req.body;
  if (!type_name) return res.status(400).json({ error: "Name is required" });

  const query = `UPDATE  complaint_type SET type_name = ?, description = ? WHERE complaint_type_id = ?`;
  try {
    await runDBCommand(query, [type_name, description, id]);
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err.message });
  }
};

exports.deleteComplaintType = async (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM  complaint_type WHERE complaint_type_id = ?`;
  try {
    await runDBCommand(query, [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      res
        .status(400)
        .json({
          error:
            "Неможливо видалити: цей тип використовується в існуючих скаргах.",
        });
    } else {
      res.status(500).json({ error: "Delete failed", details: err.message });
    }
  }
};

exports.getActionTypes = async (req, res) => {
  const query = `SELECT action_type_id, action_name, duration_days FROM action_type ORDER BY action_type_id`;
  try {
    const types = await runDBCommand(query);
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch action types" });
  }
};

exports.getActionTypeById = async (req, res) => {
  const id = req.params.id;
  const query = `SELECT action_type_id, action_name, duration_days FROM action_type WHERE action_type_id = ?`;
  try {
    const result = await runDBCommand(query, [id]);
    if (result.length === 0)
      return res.status(404).json({ error: "Type not found" });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch type" });
  }
};

exports.createActionType = async (req, res) => {
  const { action_name, duration_days } = req.body;
  if (!action_name) return res.status(400).json({ error: "Name is required" });

  const query = `INSERT INTO action_type (action_name, duration_days) VALUES (?, ?)`;
  try {
    await runDBCommand(query, [action_name, duration_days || null]);
    res.json({ message: "Created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Creation failed", details: err.message });
  }
};

exports.updateActionType = async (req, res) => {
  const id = req.params.id;
  const { action_name, duration_days } = req.body;
  if (!action_name) return res.status(400).json({ error: "Name is required" });

  const query = `UPDATE action_type SET action_name = ?, duration_days = ? WHERE action_type_id = ?`;
  try {
    await runDBCommand(query, [action_name, duration_days || null, id]);
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err.message });
  }
};

exports.deleteActionType = async (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM action_type WHERE action_type_id = ?`;
  try {
    await runDBCommand(query, [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      res
        .status(400)
        .json({
          error: "Неможливо видалити: цей тип використовується в історії дій.",
        });
    } else {
      res.status(500).json({ error: "Delete failed", details: err.message });
    }
  }
};
