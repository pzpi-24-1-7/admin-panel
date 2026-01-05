const express = require("express");
const router = express.Router();
const controller = require("../controllers/typesController");

router.get("/complaint-types", controller.getComplaintTypes);
router.get("/complaint-types/:id", controller.getComplaintTypeById);
router.post("/complaint-types", controller.createComplaintType);
router.put("/complaint-types/:id", controller.updateComplaintType);
router.delete("/complaint-types/:id", controller.deleteComplaintType);

router.get("/action-types", controller.getActionTypes);
router.get("/action-types/:id", controller.getActionTypeById);
router.post("/action-types", controller.createActionType);
router.put("/action-types/:id", controller.updateActionType);
router.delete("/action-types/:id", controller.deleteActionType);

module.exports = router;
