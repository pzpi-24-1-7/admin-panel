const { runDBCommand } = require("../config/db");

// GET /api/stats/complaints-by-type-status
exports.getComplaintStats = async (req, res) => {
  const query = `
        SELECT
            ct.type_name,
            c.status,
            COUNT(*) as count
        FROM Complaint c
        JOIN Complaint_Type ct ON c.complaint_type_id = ct.complaint_type_id
        GROUP BY ct.type_name, c.status
        ORDER BY ct.type_name, c.status
    `;
  try {
    const stats = await runDBCommand(query);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaint stats" });
  }
};

// POST /api/stats/moderator-actions
exports.getActionStats = async (req, res) => {
  const { startDate, endDate, moderatorId } = req.body;
  let query = `
        SELECT
            m.full_name,
            COUNT(ma.moderator_action_id) as action_count
        FROM Moderator_Action ma
        JOIN Moderator m ON ma.moderator_id = m.moderator_id
    `;
  const params = [];
  const whereConditions = [];

  if (startDate) {
    whereConditions.push(`ma.action_at >= ?`);
    params.push(startDate);
  }
  if (endDate) {
    whereConditions.push(`ma.action_at < DATE_ADD(?, INTERVAL 1 DAY)`);
    params.push(endDate);
  }
  if (moderatorId && moderatorId !== "all") {
    whereConditions.push(`ma.moderator_id = ?`);
    params.push(moderatorId);
  }

  if (whereConditions.length > 0) {
    query += " WHERE " + whereConditions.join(" AND ");
  }
  query += " GROUP BY m.moderator_id, m.full_name ORDER BY action_count DESC";

  try {
    const stats = await runDBCommand(query, params);
    res.json(stats);
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch moderator action stats",
        details: err.message,
      });
  }
};

exports.getViolationTrends = async (req, res) => {
  const query = `
        SELECT 
            ct.type_name,
            COUNT(c.complaint_id) as total_complaints,
            -- Считаем процент от общего числа
            ROUND(COUNT(c.complaint_id) * 100.0 / (SELECT COUNT(*) FROM Complaint), 1) as percentage,
            -- Сколько из них еще не обработано
            SUM(CASE WHEN c.status = 'new' THEN 1 ELSE 0 END) as pending_count
        FROM Complaint c
        JOIN Complaint_Type ct ON c.complaint_type_id = ct.complaint_type_id
        GROUP BY ct.type_name
        ORDER BY total_complaints DESC
    `;
  try {
    const stats = await runDBCommand(query);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trends" });
  }
};

// 2. Статистика "Эффективность команды" (Кто и как наказывает?)
exports.getModeratorPerformance = async (req, res) => {
  const query = `
        SELECT 
            m.full_name,
            COUNT(ma.moderator_action_id) as total_actions,
            -- Подсчитываем конкретные виды наказаний
            SUM(CASE WHEN at.action_name LIKE '%Блокування%' THEN 1 ELSE 0 END) as bans_issued,
            SUM(CASE WHEN at.action_name LIKE '%Попередження%' THEN 1 ELSE 0 END) as warnings_issued,
            -- Дата последнего действия
            MAX(ma.action_at) as last_active
        FROM Moderator_Action ma
        JOIN Moderator m ON ma.moderator_id = m.moderator_id
        JOIN Action_Type at ON ma.action_type_id = at.action_type_id
        GROUP BY m.moderator_id, m.full_name
        ORDER BY total_actions DESC
    `;
  try {
    const stats = await runDBCommand(query);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch performance" });
  }
};