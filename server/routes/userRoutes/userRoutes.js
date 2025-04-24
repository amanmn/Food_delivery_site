const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/authmiddleware");
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

router.post("/upload", verifyToken, upload.single("profileImage"), cloudinaryImg);

// User profile and update

router.get("/profile", verifyToken, profile);
router.put("/update/:id", updateUser);

module.exports = router;
