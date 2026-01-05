const { runDBCommand } = require("../config/db");

// GET /api/moderators
exports.getAllModerators = async (req, res) => {
  const query = `SELECT moderator_id, login, email, full_name FROM moderator ORDER BY moderator_id`;
  try {
    const moderators = await runDBCommand(query);
    res.json(moderators);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch moderators" });
  }
};

// GET /api/moderators/:id
exports.getModeratorById = async (req, res) => {
  const moderatorId = req.params.id;
  if (isNaN(moderatorId)) {
    return res.status(400).json({ error: "Invalid moderator ID format." });
  }
  const query = `SELECT moderator_id, login, email, full_name FROM moderator WHERE moderator_id = ?`;
  try {
    const result = await runDBCommand(query, [moderatorId]);
    if (result.length === 0) {
      return res.status(404).json({ error: "Moderator not found." });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch moderator details" });
  }
};

// GET /api/moderators/:id/actions
exports.getModeratorActions = async (req, res) => {
  const moderatorId = req.params.id;
  if (isNaN(moderatorId)) {
    return res.status(400).json({ error: "Invalid moderator ID format." });
  }
  const query = `
        SELECT ma.moderator_action_id, ma.target_user_id, at.action_name,
               ma.complaint_id, ma.reason_text, ma.action_at, ma.expires_at
        FROM moderator_action ma
        JOIN action_type at ON ma.action_type_id = at.action_type_id
        WHERE ma.moderator_id = ?
        ORDER BY ma.action_at DESC
    `;
  try {
    const actions = await runDBCommand(query, [moderatorId]);
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch moderator actions" });
  }
};

// POST /api/moderators
exports.createModerator = async (req, res) => {
  const { login, email, password, full_name } = req.body;
  if (!login || !email || !password || !full_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const password_hash = password;
  const query = `INSERT INTO moderator (login, email, password_hash, full_name) VALUES (?, ?, ?, ?)`;
  const params = [login, email, password_hash, full_name];
  try {
    const result = await runDBCommand(query, params);
    res.status(201).json({
      message: "Moderator added successfully",
      moderator_id: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Login or Email already exists." });
    } else {
      res.status(500).json({ error: "Failed to add moderator" });
    }
  }
};

// PUT /api/moderators/:id
exports.updateModerator = async (req, res) => {
  const moderatorId = req.params.id;
  if (isNaN(moderatorId)) {
    return res.status(400).json({ error: "Invalid moderator ID format." });
  }
  const { login, email, full_name } = req.body;
  if (!login || !email || !full_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = `UPDATE moderator SET login = ?, email = ?, full_name = ? WHERE moderator_id = ?`;
  const params = [login, email, full_name, moderatorId];
  try {
    const result = await runDBCommand(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Moderator not found." });
    }
    res.status(200).json({ message: "Moderator updated successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Login or Email already exists." });
    } else {
      res
        .status(500)
        .json({ error: "Failed to UPDATE moderator", details: err.message });
    }
  }
};

// DELETE /api/moderators/:id
exports.deleteModerator = async (req, res) => {
  const moderatorId = req.params.id;
  if (isNaN(moderatorId)) {
    return res.status(400).json({ error: "Invalid moderator ID format." });
  }
  const query = `DELETE FROM moderator WHERE moderator_id = ?`;
  const params = [moderatorId];
  try {
    const result = await runDBCommand(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Moderator not found." });
    }
    res.status(200).json({ message: "Moderator deleted successfully" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      res
        .status(400)
        .json({
          error:
            "Cannot delete moderator: They are referenced by other records.",
        });
    } else {
      res
        .status(500)
        .json({ error: "Failed to delete moderator", details: err.message });
    }
  }
};
