const { runDBCommand } = require("../config/db");

// ================= COMPLAINT TYPES =================

// GET ALL
exports.getComplaintTypes = async (req, res) => {
  const query = `SELECT complaint_type_id, type_name, description FROM Complaint_Type ORDER BY complaint_type_id`;
  try {
    const types = await runDBCommand(query);
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaint types" });
  }
};

// GET ONE (BY ID) - для редактирования
exports.getComplaintTypeById = async (req, res) => {
  const id = req.params.id;
  const query = `SELECT complaint_type_id, type_name, description FROM Complaint_Type WHERE complaint_type_id = ?`;
  try {
    const result = await runDBCommand(query, [id]);
    if (result.length === 0)
      return res.status(404).json({ error: "Type not found" });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch type" });
  }
};

// CREATE
exports.createComplaintType = async (req, res) => {
  const { type_name, description } = req.body;
  if (!type_name) return res.status(400).json({ error: "Name is required" });

  const query = `INSERT INTO Complaint_Type (type_name, description) VALUES (?, ?)`;
  try {
    await runDBCommand(query, [type_name, description]);
    res.json({ message: "Created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Creation failed", details: err.message });
  }
};

// UPDATE
exports.updateComplaintType = async (req, res) => {
  const id = req.params.id;
  const { type_name, description } = req.body;
  if (!type_name) return res.status(400).json({ error: "Name is required" });

  const query = `UPDATE Complaint_Type SET type_name = ?, description = ? WHERE complaint_type_id = ?`;
  try {
    await runDBCommand(query, [type_name, description, id]);
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err.message });
  }
};

// DELETE
exports.deleteComplaintType = async (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM Complaint_Type WHERE complaint_type_id = ?`;
  try {
    await runDBCommand(query, [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    // Обработка ошибки внешнего ключа (если тип уже используется в жалобах)
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

// ================= ACTION TYPES =================

// GET ALL
exports.getActionTypes = async (req, res) => {
  const query = `SELECT action_type_id, action_name, duration_days FROM Action_Type ORDER BY action_type_id`;
  try {
    const types = await runDBCommand(query);
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch action types" });
  }
};

// GET ONE
exports.getActionTypeById = async (req, res) => {
  const id = req.params.id;
  const query = `SELECT action_type_id, action_name, duration_days FROM Action_Type WHERE action_type_id = ?`;
  try {
    const result = await runDBCommand(query, [id]);
    if (result.length === 0)
      return res.status(404).json({ error: "Type not found" });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch type" });
  }
};

// CREATE
exports.createActionType = async (req, res) => {
  const { action_name, duration_days } = req.body;
  if (!action_name) return res.status(400).json({ error: "Name is required" });

  const query = `INSERT INTO Action_Type (action_name, duration_days) VALUES (?, ?)`;
  try {
    await runDBCommand(query, [action_name, duration_days || null]);
    res.json({ message: "Created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Creation failed", details: err.message });
  }
};

// UPDATE
exports.updateActionType = async (req, res) => {
  const id = req.params.id;
  const { action_name, duration_days } = req.body;
  if (!action_name) return res.status(400).json({ error: "Name is required" });

  const query = `UPDATE Action_Type SET action_name = ?, duration_days = ? WHERE action_type_id = ?`;
  try {
    await runDBCommand(query, [action_name, duration_days || null, id]);
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err.message });
  }
};

// DELETE
exports.deleteActionType = async (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM Action_Type WHERE action_type_id = ?`;
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
