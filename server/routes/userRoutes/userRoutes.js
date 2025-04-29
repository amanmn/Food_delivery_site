const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authmiddleware");
const {
  register,
  login,
  cloudinaryImg,
  profile,
  updateUser,
  upload, // uploading images
} = require("../../controllers/userController");

// Auth routes
router.post("/register", register);
router.post("/login", login);


// Image upload route (optional, if you're using it)
router.post("/upload", authMiddleware, upload.single("profileImage"), cloudinaryImg);
router.get("/profile", authMiddleware, profile);
router.put("/update",authMiddleware, updateUser);

module.exports = router;
