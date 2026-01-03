const express = require("express");
const router = express.Router();
const controller = require("../controllers/complaintController");

router.get("/", controller.getAllComplaints); // GET /api/complaints
router.post("/", controller.createComplaint); // POST /api/complaints

module.exports = router;
