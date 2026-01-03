const express = require("express");
const router = express.Router();
const controller = require("../controllers/complaintManagementController");

router.post("/add", controller.createComplaint); // POST /api/complaints
router.get("/search", controller.searchComplaints);
router.get("/:id", controller.getComplaintDetails);
router.put("/:id/resolve", controller.resolveComplaint);

module.exports = router;
