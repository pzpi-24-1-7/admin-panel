const express = require("express");
const router = express.Router();
const controller = require("../controllers/moderatorController");

router.get("/", controller.getAllModerators); // GET /api/moderators
router.get("/:id", controller.getModeratorById); // GET /api/moderators/5
router.get("/:id/actions", controller.getModeratorActions); // GET /api/moderators/5/actions
router.post("/", controller.createModerator); // POST /api/moderators
router.put("/:id", controller.updateModerator); // PUT /api/moderators/5
router.delete("/:id", controller.deleteModerator); // DELETE /api/moderators/5

module.exports = router;
