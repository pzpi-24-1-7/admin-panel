const { runDBCommand } = require("../config/db");

exports.searchUsers = async (req, res) => {
  const { id, email, name, city, country, age, status, sortBy, sortOrder } =
    req.query;

  let query = `
    SELECT u.user_id, u.login, u.email, u.account_status, u.created_at,
           p.first_name, p.city, p.country, p.birth_date
    FROM user u
    LEFT JOIN profile p ON u.user_id = p.user_id
    WHERE 1=1 
  `;

  const params = [];

  if (id) {
    query += ` AND u.user_id = ?`;
    params.push(id);
  } else if (email) {
    query += ` AND u.email LIKE ?`;
    params.push(`%${email}%`);
  } else {
    if (name) {
      query += ` AND (p.first_name LIKE ? OR u.login LIKE ?)`;
      params.push(`%${name}%`, `%${name}%`);
    }
    if (city) {
      query += ` AND p.city LIKE ?`;
      params.push(`%${city}%`);
    }
    if (country) {
      query += ` AND p.country LIKE ?`;
      params.push(`%${country}%`);
    }
    if (age) {
      query += ` AND TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) = ?`;
      params.push(age);
    }
  }

  if (status && status !== "all") {
    query += ` AND u.account_status = ?`;
    params.push(status);
  }

  const sortableColumns = [
    "user_id",
    "login",
    "email",
    "account_status",
    "created_at",
    "first_name",
  ];
  const orderBy = sortableColumns.includes(sortBy) ? sortBy : "u.created_at";
  const direction = sortOrder === "ASC" ? "ASC" : "DESC";

  query += ` ORDER BY ${orderBy} ${direction} LIMIT 50`;

  try {
    const users = await runDBCommand(query, params);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error searching users" });
  }
};

exports.getUserFullDetails = async (req, res) => {
  const userId = req.params.id;
  try {
    const userQuery = `
      SELECT u.user_id, u.login, u.email, u.account_status, u.created_at, u.last_login,
             p.first_name, p.birth_date, p.age, p.city, p.country, p.gender, p.bio_text, p.bio_status
      FROM user u
      LEFT JOIN profile p ON u.user_id = p.user_id
      WHERE u.user_id = ?
    `;
    const userRows = await runDBCommand(userQuery, [userId]);
    if (userRows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const photosQuery = `SELECT * FROM user_photo WHERE user_id = ?`;
    const photos = await runDBCommand(photosQuery, [userId]);

    const commentsQuery = `
      SELECT ac.*, m.login as moderator_login 
      FROM admin_comment ac
      JOIN moderator m ON ac.moderator_id = m.moderator_id
      WHERE ac.target_user_id = ?
      ORDER BY ac.created_at DESC
    `;
    const comments = await runDBCommand(commentsQuery, [userId]);

    res.json({ user: userRows[0], photos, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching details" });
  }
};

exports.updateUserGeneral = async (req, res) => {
  const userId = req.params.id;
  const { email, first_name, city, country, birth_date, gender } = req.body;

  try {
    await runDBCommand(`UPDATE user SET email = ? WHERE user_id = ?`, [
      email,
      userId,
    ]);

    await runDBCommand(
      `UPDATE profile SET first_name = ?, city = ?, country = ?, birth_date = ?, gender = ? WHERE user_id = ?`,
      [first_name, city, country, birth_date, gender, userId]
    );
    res.json({ message: "User updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

exports.changeUserStatus = async (req, res) => {
  const userId = req.params.id;
  const { status } = req.body; // 'active' or 'blocked'
  try {
    await runDBCommand(`UPDATE user SET account_status = ? WHERE user_id = ?`, [
      status,
      userId,
    ]);
    res.json({ message: `User status changed to ${status}` });
  } catch (err) {
    res.status(500).json({ error: "Status change failed" });
  }
};

exports.moderateBio = async (req, res) => {
  const userId = req.params.id;
  const { action } = req.body; // 'ban', 'unban', 'delete'

  let query = "";
  let params = [];

  if (action === "delete") {
    query = `UPDATE profile SET bio_text = NULL, bio_status = 'approved' WHERE user_id = ?`;
    params = [userId];
  } else {
    const status = action === "ban" ? "banned" : "approved";
    query = `UPDATE profile SET bio_status = ? WHERE user_id = ?`;
    params = [status, userId];
  }

  try {
    await runDBCommand(query, params);
    res.json({ message: `Bio action '${action}' executed` });
  } catch (err) {
    res.status(500).json({ error: "Bio moderation failed" });
  }
};

exports.moderatePhoto = async (req, res) => {
  const photoId = req.params.photoId;
  const { action } = req.body; // 'ban', 'unban', 'delete'

  try {
    if (action === "delete") {
      await runDBCommand(`DELETE FROM user_photo WHERE photo_id = ?`, [
        photoId,
      ]);
    } else {
      const status = action === "ban" ? "banned" : "approved";
      await runDBCommand(
        `UPDATE user_photo SET moderation_status = ? WHERE photo_id = ?`,
        [status, photoId]
      );
    }
    res.json({ message: "Photo updated" });
  } catch (err) {
    res.status(500).json({ error: "Photo action failed" });
  }
};

exports.addPhoto = async (req, res) => {
  const userId = req.params.id;

  let photoUrl = "";

  if (req.file) {
    
    photoUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  }
  else if (req.body.photo_url) {
    photoUrl = req.body.photo_url;
  } else {
    return res.status(400).json({ error: "No file or URL provided" });
  }

  try {
    await runDBCommand(
      `INSERT INTO user_photo (user_id, photo_url, is_main) VALUES (?, ?, 0)`,
      [userId, photoUrl]
    );
    res.json({ message: "Photo added", url: photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

exports.addComment = async (req, res) => {
  const userId = req.params.id;
  const { moderator_id, comment_text } = req.body;
  try {
    await runDBCommand(
      `INSERT INTO admin_comment (target_user_id, moderator_id, comment_text) VALUES (?, ?, ?)`,
      [userId, moderator_id, comment_text]
    );
    res.json({ message: "Comment added" });
  } catch (err) {
    res.status(500).json({ error: "Comment failed" });
  }
};

exports.deleteUserSoft = async (req, res) => {
  const userId = req.params.id;

  try {
    const profileQuery = `SELECT birth_date FROM Profile WHERE user_id = ?`;
    const profileResult = await runDBCommand(profileQuery, [userId]);

    let ageToSave = null;

    if (profileResult.length > 0 && profileResult[0].birth_date) {
      const birthDate = new Date(profileResult[0].birth_date);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      ageToSave = age;
    }

    await runDBCommand(
      `UPDATE user SET account_status = 'deleted' WHERE user_id = ?`,
      [userId]
    );

    await runDBCommand(
      `UPDATE profile SET city = NULL, bio_text = NULL, birth_date = NULL, age = ? WHERE user_id = ?`,
      [ageToSave, userId]
    );

    await runDBCommand(`DELETE FROM user_photo WHERE user_id = ?`, [userId]);

    await runDBCommand(
      `UPDATE message SET message_text = '[Повідомлення видалено]' WHERE sender_user_id = ?`,
      [userId]
    );

    await runDBCommand(
      `UPDATE complaint SET status = 'closed' WHERE target_user_id = ? AND status != 'closed'`,
      [userId]
    );

    res.json({ message: "User anonymized and deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete user data" });
  }
};

exports.getUserChats = async (req, res) => {
  const userId = req.params.id;
  try {
    const query = `
            SELECT 
                u.user_id as partner_id,
                u.login as partner_login,
                u.email as partner_email,
                MAX(m.sent_at) as last_message_at
            FROM Message m
            JOIN User u ON (u.user_id = m.sender_user_id OR u.user_id = m.recipient_user_id)
            WHERE (m.sender_user_id = ? OR m.recipient_user_id = ?)
              AND u.user_id != ?
            GROUP BY u.user_id, u.login, u.email
            ORDER BY last_message_at DESC
        `;
    const chats = await runDBCommand(query, [userId, userId, userId]);
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

exports.getChatMessages = async (req, res) => {
  const userId = req.params.id;
  const partnerId = req.params.partnerId;

  try {
    const query = `
            SELECT 
                m.message_id,
                m.sender_user_id,
                m.message_text,
                m.sent_at,
                m.read_status,
                sender.login as sender_login
            FROM Message m
            JOIN User sender ON m.sender_user_id = sender.user_id
            WHERE (m.sender_user_id = ? AND m.recipient_user_id = ?)
               OR (m.sender_user_id = ? AND m.recipient_user_id = ?)
            ORDER BY m.sent_at ASC
        `;
    const messages = await runDBCommand(query, [
      userId,
      partnerId,
      partnerId,
      userId,
    ]);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
