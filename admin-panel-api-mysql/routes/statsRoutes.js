const express = require("express");
const router = express.Router();
const controller = require("../controllers/statsController");

router.get("/complaints-by-type-status", controller.getComplaintStats);
router.post("/moderator-actions", controller.getActionStats);
router.get("/violation-trends", controller.getViolationTrends);
router.get("/moderator-performance", controller.getModeratorPerformance);

module.exports = router;
