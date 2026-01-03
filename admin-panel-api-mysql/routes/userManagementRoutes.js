const express = require("express");
const router = express.Router();
const controller = require("../controllers/userManagementController");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "photo-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get("/search", controller.searchUsers);

router.get("/:id/details", controller.getUserFullDetails);

router.put("/:id/general", controller.updateUserGeneral);
router.put("/:id/status", controller.changeUserStatus);
router.put("/:id/bio", controller.moderateBio);

router.post("/:id/photos", upload.single("image"), controller.addPhoto);
router.put("/photos/:photoId", controller.moderatePhoto);

router.get("/:id/chats", controller.getUserChats);
router.get("/:id/chats/:partnerId", controller.getChatMessages);

router.post("/:id/comments", controller.addComment);
router.put("/:id/delete", controller.deleteUserSoft);

module.exports = router;
