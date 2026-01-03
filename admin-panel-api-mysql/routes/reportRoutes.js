const express = require("express");
const router = express.Router();
const controller = require("../controllers/reportController");

router.get("/user-dossier/:id", controller.getUserDossierPdf);
router.get("/monthly-activity", controller.getMonthlyReportPdf);

module.exports = router;
