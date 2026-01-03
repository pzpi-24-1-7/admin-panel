const { runDBCommand } = require("../config/db");

// GET /api/complaints
exports.getAllComplaints = async (req, res) => {
  const query = `
        SELECT
            c.complaint_id, c.reporter_user_id, c.target_user_id,
            m.full_name as moderator_name,
            ct.type_name as complaint_type_name,
            c.description, c.status, c.created_at
        FROM Complaint c
        LEFT JOIN Moderator m ON c.moderator_id = m.moderator_id
        JOIN Complaint_Type ct ON c.complaint_type_id = ct.complaint_type_id
        ORDER BY c.created_at DESC
    `;
  try {
    const complaints = await runDBCommand(query);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
};

// POST /api/complaints
exports.createComplaint = async (req, res) => {
  const {
    reporter_user_id,
    target_user_id,
    moderator_id,
    complaint_type_id,
    description,
  } = req.body;

  if (!reporter_user_id || !target_user_id || !complaint_type_id) {
    return res.status(400).json({
      error:
        "Missing required fields: reporter_user_id, target_user_id, complaint_type_id",
    });
  }
  const query = `
        INSERT INTO Complaint (reporter_user_id, target_user_id, moderator_id, complaint_type_id, description, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'new', NOW()) 
    `;
  const params = [
    reporter_user_id,
    target_user_id,
    moderator_id || null,
    complaint_type_id,
    description || null,
  ];
  try {
    const result = await runDBCommand(query, params);
    res.status(201).json({
      message: "Complaint added successfully",
      complaint_id: result.insertId,
    });
  } catch (err) {
    console.error("Error adding complaint:", err);
    res
      .status(500)
      .json({ error: "Failed to add complaint", details: err.message });
  }
};
