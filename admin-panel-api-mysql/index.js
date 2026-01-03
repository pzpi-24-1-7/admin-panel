const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { connection } = require("./config/db");

const moderatorRoutes = require("./routes/moderatorRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const actionRoutes = require("./routes/actionRoutes");
const typesRoutes = require("./routes/typesRoutes");
const statsRoutes = require("./routes/statsRoutes");
const userManagementRoutes = require("./routes/userManagementRoutes");
const complaintManagementRoutes = require("./routes/complaintManagementRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use("/uploads", express.static("uploads")); // Открываем доступ к папке
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/moderators", moderatorRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/types", typesRoutes);
app.use("/api/manage/users", userManagementRoutes);
app.use("/api/manage/complaints", complaintManagementRoutes);

app.use("/api/stats", statsRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("Admin Panel API is running successfully!");
});

app.listen(port, () => {
  console.log(
    `Server started successfully and listening on http://localhost:${port}`
  );
});

process.on("SIGINT", () => {
  console.log("Closing MySQL connection...");
  connection.end((err) => {
    if (err) {
      console.error("Error closing MySQL connection:", err);
    } else {
      console.log("MySQL connection closed.");
    }
    process.exit(err ? 1 : 0);
  });
});
