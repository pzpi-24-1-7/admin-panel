const PDFDocument = require("pdfkit");
const { runDBCommand } = require("../config/db");
const fs = require("fs");
const path = require("path");

const fontPath = path.join(__dirname, "../fonts/Roboto-Regular.ttf");

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function generateTableRow(doc, y, col1, col2, col3, col4) {
  doc
    .fontSize(10)
    .text(col1, 50, y, { width: 120 })
    .text(col2, 170, y, { width: 100 })
    .text(col3, 270, y, { width: 100, align: "right" })
    .text(col4, 370, y, { width: 150, align: "right" });
}

exports.getUserDossierPdf = async (req, res) => {
  const userId = req.params.id;

  try {
    const userQuery = `
            SELECT 
                u.login, u.email, u.account_status, u.created_at, u.last_login,
                p.first_name, p.city, p.country, p.birth_date, p.gender, p.bio_text
            FROM User u
            LEFT JOIN Profile p ON u.user_id = p.user_id
            WHERE u.user_id = ?
        `;
    const userRes = await runDBCommand(userQuery, [userId]);

    if (userRes.length === 0) return res.status(404).send("User not found");
    const user = userRes[0];

    const complaintsQuery = `
            SELECT ct.type_name, c.created_at, c.status, c.description
            FROM Complaint c
            JOIN Complaint_Type ct ON c.complaint_type_id = ct.complaint_type_id
            WHERE c.target_user_id = ?
            ORDER BY c.created_at DESC
        `;
    const complaints = await runDBCommand(complaintsQuery, [userId]);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=dossier_${user.login}.pdf`
    );

    doc.pipe(res);
    doc.font(fontPath);

    doc.fontSize(24).text("Досьє Користувача", { align: "center" });
    doc
      .fontSize(10)
      .text(`Згенеровано: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown();
    generateHr(doc, doc.y);
    doc.moveDown();

    doc
      .fontSize(14)
      .fillColor("black")
      .text("Обліковий запис", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Логін: ${user.login}`);
    doc.text(`Email: ${user.email}`);

    let statusText = user.account_status;
    doc.text(`Статус: ${statusText}`);

    doc.text(
      `Дата реєстрації: ${new Date(user.created_at).toLocaleDateString()}`
    );
    doc.text(
      `Останній вхід: ${
        user.last_login ? new Date(user.last_login).toLocaleString() : "Ніколи"
      }`
    );
    doc.moveDown();

    doc.fontSize(14).text("Дані Профілю", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Ім'я: ${user.first_name || "Не вказано"}`);
    doc.text(`Стать: ${user.gender || "-"}`);
    doc.text(
      `Дата народження: ${
        user.birth_date ? new Date(user.birth_date).toLocaleDateString() : "-"
      }`
    );

    const location = [user.city, user.country].filter(Boolean).join(", ");
    doc.text(`Локація: ${location || "Не вказано"}`);

    doc.moveDown(0.5);
    doc.font(fontPath).fontSize(12).text("Про себе (Bio):");
    doc
      .fontSize(10)
      .font(fontPath)
      .text(user.bio_text || "Опис відсутній", {
        oblique: true,
        indent: 20,
        align: "justify",
        width: 450,
      });
    doc.font(fontPath);
    doc.moveDown();

    generateHr(doc, doc.y);
    doc.moveDown();

    doc
      .fontSize(14)
      .text(`Історія порушень (${complaints.length})`, { underline: true });
    doc.moveDown();

    const tableTop = doc.y;
    doc.fontSize(10).fillColor("black");

    generateTableRow(doc, tableTop, "Тип", "Дата", "Статус", "Деталі");
    generateHr(doc, tableTop + 15);

    let i = 0;
    complaints.forEach((c) => {
      let y = tableTop + 25 + i * 25;

      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const desc = c.description
        ? c.description.replace(/\n/g, " ").substring(0, 25) + "..."
        : "-";

      generateTableRow(
        doc,
        y,
        c.type_name,
        new Date(c.created_at).toLocaleDateString(),
        c.status,
        desc
      );
      i++;
    });

    if (complaints.length === 0) {
      doc.moveDown();
      doc.fontSize(12).text("Порушень не знайдено. Чистий користувач.", {
        align: "center",
        color: "green",
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send("Error generating PDF");
  }
};

exports.getMonthlyReportPdf = async (req, res) => {
  try {
    const query = `
            SELECT m.full_name, 
                   COUNT(ma.moderator_action_id) as total,
                   MAX(ma.action_at) as last_action
            FROM Moderator_Action ma
            JOIN Moderator m ON ma.moderator_id = m.moderator_id
            WHERE ma.action_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)
            GROUP BY m.full_name
        `;
    const stats = await runDBCommand(query);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=monthly_report.pdf`
    );
    doc.pipe(res);
    doc.font(fontPath);

    doc.fontSize(18).text("Звіт активності модераторів", { align: "center" });
    doc
      .fontSize(10)
      .text(`Сформовано: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown();
    generateHr(doc, doc.y);
    doc.moveDown();

    doc
      .fontSize(12)
      .text("Статистика за останні 30 днів:", { underline: true });
    doc.moveDown();

    const tableTop = doc.y;
    doc.fontSize(10).text("ПІБ Модератора", 50, tableTop);
    doc.text("Всього дій", 300, tableTop);
    doc.text("Остання активність", 400, tableTop);
    generateHr(doc, tableTop + 15);

    let i = 0;
    stats.forEach((row) => {
      const y = tableTop + 25 + i * 25;

      doc.text(row.full_name, 50, y);
      doc.text(row.total.toString(), 300, y);
      doc.text(new Date(row.last_action).toLocaleDateString(), 400, y);

      i++;
    });

    doc.moveDown(2);
    doc
      .fontSize(10)
      .text('Звіт згенеровано автоматично системою "AdminPanel".', {
        align: "center",
        color: "grey",
      });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
};
