const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");

const {
  register,
  login,
  logout,
  cloudinaryImg,
  profile,
  updateUser,
  upload,
} = require("../../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

router.get("/profile", authMiddleware, profile);
router.put("/update", authMiddleware, updateUser);

// Optional image upload
router.post("/upload", authMiddleware, upload.single("profileImage"), cloudinaryImg);

module.exports = router;
