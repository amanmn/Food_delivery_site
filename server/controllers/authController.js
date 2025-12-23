const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
const { generateToken, setTokenCookie } = require("../utils/generateToken");
const sendOtpNodeMailer = require("../utils/nodemailer.js");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
const OTP_TTL_MS = 5 * 60 * 1000;

// consistent error responses
const handleServerError = (res, err, msg = "Server error") => {
    console.error(msg, err);
    return res.status(500).json({ success: false, message: msg });
};

const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        console.log(req.body);

        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        if (phone.length < 10) {
            return res.status(400).json({ success: false, message: "Phone number must be at least 10 digits." });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const userData = {
            name,
            email,
            phone,
            role,
            password: hashedPassword,
        };

        console.log("before", userData);


        // Handle location for deliveryBoy
        if (role === "deliveryBoy") {
            userData.location = {
                type: "Point",
                coordinates: [0, 0], // default or actual coordinates
            };
        }

        const user = new User(userData);
        console.log("after", user);

        await user.save();

        const token = generateToken({ id: user._id });
        setTokenCookie(res, token);

        // Return response
        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: "Email already in use." });
        }

        console.error("Registration Error:", err);
        return handleServerError(res, err, "Registration failed");
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken({ id: user._id, role: user.role });
        setTokenCookie(res, token);

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
        };

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            user: userData,
            token,
        });

    } catch (err) {
        return handleServerError(res, err, "Login failed");
    }
};

// ✅ Logout Controller (Clear Cookie)
const logout = (req, res) => {
    try {
        // clears cookies and expires immediately
        res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        return handleServerError(res, err, "Logout failed");
    }

};

const getMe = async (req, res) => {
    try {
        console.log("req.user:", req.user);
        const user = await User.findById(req.user.id).select("-password");
        console.log("user:", user);
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        // console.log("req.user:", req.user);
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return handleServerError(res, error, "Fetch user failed");
    }
};

const sendOtpMail = async (req, res) => {
    try {
        const { email } = req.body;
        // if (!email) return res.status(400).json({ success: false, message: "Email is required." })

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User does not exists." });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        user.resetOtp = otp;
        user.otpExpires = Date.now() + OTP_TTL_MS;
        user.isOtpVerified = false;
        await user.save();

        try {
            await sendOtpNodeMailer(email, otp);
        } catch (mailerErr) {
            console.error("Failed to send OTP email:", mailerErr);
            user.resetOtp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: "Failed to send OTP email." });
        }
        return res.status(200).json({ success: "true", message: "OTP sent successfully" });
    }
    catch (error) {
        return handleServerError(res, err, "Send OTP failed");
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        // if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required." });

        const user = await User.findOne({ email });
        if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) return res.status(400).json({ success: false, message: "invalid or expired OTP." });

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "OTP verified successfully.   " })
    } catch (error) {
        return handleServerError(res, err, "Verify OTP failed");
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        // if (!email || !newPassword) return res.status(400).json({ success: false, message: "Email and newPassword are required." });
        // if (newPassword.length < 6) {
        //     return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
        // }

        const user = await User.findOne({ email });
        if (!user || !user.isOtpVerified) return res.status(400).json({ success: false, message: "Unauthorized or OTP not verified." });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordChangedAt = Date.now();
        user.isOtpVerified = false;
        await user.save();

        return res.status(200).json({ success: true, message: "password reset successfully" })
    } catch (error) {
        return handleServerError(res, err, "Reset password failed");
    }
}

module.exports = {
    register,
    login,
    logout,
    getMe,
    sendOtpMail,
    verifyOtp,
    resetPassword,
}