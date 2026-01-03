const express = require("express");
const router = express.Router();
const controller = require("../controllers/typesController");

// --- Типи Скарг ---
router.get("/complaint-types", controller.getComplaintTypes);
router.get("/complaint-types/:id", controller.getComplaintTypeById); // Для редагування
router.post("/complaint-types", controller.createComplaintType);
router.put("/complaint-types/:id", controller.updateComplaintType);
router.delete("/complaint-types/:id", controller.deleteComplaintType);

// --- Типи Дій ---
router.get("/action-types", controller.getActionTypes);
router.get("/action-types/:id", controller.getActionTypeById); // Для редагування
router.post("/action-types", controller.createActionType);
router.put("/action-types/:id", controller.updateActionType);
router.delete("/action-types/:id", controller.deleteActionType);

module.exports = router;
