const express = require("express");
const router = express.Router();
const controller = require("../controllers/actionController");

router.get("/", controller.getAllActions); // GET /api/actions
router.post("/", controller.createAction); // POST /api/actions

module.exports = router;
