const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authmiddleware");

const {
  cloudinaryImg,
  profile,
  updateUser,
  upload,
} = require("../controllers/userController");

router.get("/profile", verifyToken, profile);
router.put("/update", verifyToken, updateUser);
router.post("/upload", verifyToken, upload.single("profileImage"), cloudinaryImg);

module.exports = router;
