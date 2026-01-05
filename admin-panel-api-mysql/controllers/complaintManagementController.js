const { runDBCommand } = require("../config/db");

exports.searchComplaints = async (req, res) => {
  const {
    search,
    status,
    moderator_id,
    reporter_email,
    target_email,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  } = req.query;

  let query = `
    SELECT 
        c.complaint_id, c.description, c.status, c.created_at,
        ct.type_name,
        u_rep.email as reporter_email,
        u_tar.email as target_email,
        m.full_name as moderator_name
    FROM  complaint c
    JOIN  complaint_type ct ON c.complaint_type_id = ct.complaint_type_id
    LEFT JOIN user u_rep ON c.reporter_user_id = u_rep.user_id
    LEFT JOIN user u_tar ON c.target_user_id = u_tar.user_id
    LEFT JOIN moderator m ON c.moderator_id = m.moderator_id
    LEFT JOIN moderator_action ma ON c.complaint_id = ma.complaint_id
    WHERE 1=1
  `;

  const params = [];

  if (search) {
    query += ` AND (c.complaint_id = ? OR c.description LIKE ? OR ma.reason_text LIKE ?)`;
    params.push(search, `%${search}%`, `%${search}%`);
  }

  if (startDate) {
    query += ` AND c.created_at >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND c.created_at < DATE_ADD(?, INTERVAL 1 DAY)`;
    params.push(endDate);
  }

  if (status && status !== "all") {
    query += ` AND c.status = ?`;
    params.push(status);
  } else if (!status) {
    query += ` AND c.status = 'new'`;
  }

  if (moderator_id) {
    query += ` AND c.moderator_id = ?`;
    params.push(moderator_id);
  }
  if (reporter_email) {
    query += ` AND u_rep.email LIKE ?`;
    params.push(`%${reporter_email}%`);
  }
  if (target_email) {
    query += ` AND u_tar.email LIKE ?`;
    params.push(`%${target_email}%`);
  }

  query += ` GROUP BY c.complaint_id`;

  const allowedSort = ["complaint_id", "created_at", "status", "type_name"];
  const orderCol = allowedSort.includes(sortBy) ? sortBy : "c.created_at";
  const orderDir = sortOrder === "ASC" ? "ASC" : "DESC";

  query += ` ORDER BY ${orderCol} ${orderDir} LIMIT 50`;

  try {
    const complaints = await runDBCommand(query, params);
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error searching complaints" });
  }
};

exports.getComplaintDetails = async (req, res) => {
  const id = req.params.id;
  try {
    const complaintQuery = `
            SELECT 
                c.complaint_id, c.description, c.status, c.created_at,
                ct.type_name,
                c.reporter_user_id, u_rep.email as reporter_email,
                c.target_user_id, u_tar.email as target_email,
                c.moderator_id, m.full_name as moderator_name
            FROM  complaint c
            JOIN  complaint_type ct ON c.complaint_type_id = ct.complaint_type_id
            LEFT JOIN user u_rep ON c.reporter_user_id = u_rep.user_id
            LEFT JOIN user u_tar ON c.target_user_id = u_tar.user_id
            LEFT JOIN moderator m ON c.moderator_id = m.moderator_id
            WHERE c.complaint_id = ?
        `;
    const complaintResult = await runDBCommand(complaintQuery, [id]);

    if (complaintResult.length === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const actionsQuery = `
            SELECT 
                ma.moderator_action_id, -- Или action_id, если вы не переименовали колонку
                ma.reason_text,
                ma.action_at,
                at.action_name,
                m.full_name as moderator_name
            FROM moderator_action ma
            JOIN action_type at ON ma.action_type_id = at.action_type_id
            JOIN moderator m ON ma.moderator_id = m.moderator_id
            WHERE ma.complaint_id = ?
            ORDER BY ma.action_at DESC
        `;
    const actionsResult = await runDBCommand(actionsQuery, [id]);

    res.json({
      complaint: complaintResult[0],
      actions: actionsResult,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching details" });
  }
};

exports.resolveComplaint = async (req, res) => {
  const id = req.params.id;
  const { status, moderator_comment, moderator_id } = req.body;

  try {
    await runDBCommand(
      `UPDATE  complaint SET status = ?, moderator_id = ? WHERE complaint_id = ?`,
      [status, moderator_id, id]
    );

    const comment = moderator_comment || `Зміна статусу на ${status}`;

    await runDBCommand(
      `INSERT INTO moderator_action (moderator_id, complaint_id, action_type_id, reason_text, action_at) 
             VALUES (?, ?, 1, ?, NOW())`,
      [moderator_id, id, comment]
    );

    res.json({ message: "Complaint updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

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
        INSERT INTO  complaint (reporter_user_id, target_user_id, moderator_id, complaint_type_id, description, status, created_at)
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
