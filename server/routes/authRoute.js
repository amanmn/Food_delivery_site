const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, sendOtpMail, verifyOtp, resetPassword } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authmiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);

router.post("/send-otp", sendOtpMail);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.get("/me", verifyToken, getMe);

module.exports = router;
