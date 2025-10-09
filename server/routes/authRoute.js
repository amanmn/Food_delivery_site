const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const { register, login, logout, getMe, sendOtpMail, verifyOtp, resetPassword } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authmiddleware");

// register route
router.post(
    "/register",
    [
        body("name")
            .notEmpty()
            .withMessage("Name is required")
            .isLength({ min: 3 })
            .withMessage("Name must be at least 3 characters long"),

        body("email")
            .isEmail()
            .withMessage("Please enter a valid email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),

        body("phone")
            .notEmpty()
            .withMessage("Phone number is required")
            .isMobilePhone()
            .withMessage("Please enter a valid phone number"),
    ],
    validateRequest,
    register
);

//  login route
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Please enter a valid email"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    validateRequest,
    login
);

// logout protected
router.post("/logout", verifyToken, logout);

// send-OTP route
router.post(
    "/send-otp",
    [body("email").isEmail().withMessage("Valid email is required")],
    validateRequest,
    sendOtpMail
);

// Verify OTP (email + otp)
router.post(
    "/verify-otp",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("otp").notEmpty().withMessage("OTP is required"),
    ],
    validateRequest,
    verifyOtp
);

// reset-password (email, newPassword)
router.post(
    "/reset-password",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("newPassword")
            .isLength({ min: 6 })
            .withMessage("New password must be at least 6 characters long"),
    ],
    validateRequest,
    resetPassword
);

// ✅ Get Logged-In User Info ---> GET : /api/auth/me
router.get("/me", verifyToken, getMe);

module.exports = router;
