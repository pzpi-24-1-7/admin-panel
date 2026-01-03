const { runDBCommand } = require("../config/db");

// GET /api/actions
exports.getAllActions = async (req, res) => {
  const query = `
        SELECT ma.moderator_action_id, m.full_name as moderator_name, ma.target_user_id,
               at.action_name, ma.complaint_id, ma.reason_text, ma.action_at, ma.expires_at
        FROM Moderator_Action ma
        JOIN Moderator m ON ma.moderator_id = m.moderator_id
        JOIN Action_Type at ON ma.action_type_id = at.action_type_id
        ORDER BY ma.action_at DESC
    `;
  try {
    const actions = await runDBCommand(query);
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch moderator actions" });
  }
};

// POST /api/actions
exports.createAction = async (req, res) => {
  const {
    moderator_id,
    target_user_id,
    action_type_id,
    complaint_id,
    reason_text,
    expires_at,
  } = req.body;
  if (!moderator_id || !target_user_id || !action_type_id) {
    return res.status(400).json({
      error:
        "Missing required fields: moderator_id, target_user_id, action_type_id",
    });
  }
  const query = `
        INSERT INTO Moderator_Action (moderator_id, target_user_id, action_type_id, complaint_id, reason_text, action_at, expires_at)
        VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `;
  const params = [
    moderator_id,
    target_user_id,
    action_type_id,
    complaint_id || null,
    reason_text || null,
    expires_at || null,
  ];
  try {
    const result = await runDBCommand(query, params);
    res.status(201).json({
      message: "Moderator action added successfully",
      action_id: result.insertId,
    });
  } catch (err) {
    console.error("Error adding moderator action:", err);
    res.status(500).json({
      error: "Failed to add moderator action",
      details: err.message,
    });
  }
};
