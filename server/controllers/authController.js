const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
const { generateToken, setTokenCookie } = require("../utils/generateToken");
const { userApi } = require("../../client/src/redux/features/user/userApi.js");

// ✅ Register Controller
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "User already exists" });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: "password must be atleast 6 characters." })
        }
        if (phone.length < 10) {
            return res.status(400).json({ success: false, message: "phone number must be atleast 10 digits." })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            role,
            phone,
            password: hashedPassword,
        });
        const token = generateToken({ id: user._id, email: user.email, role: user.role });

        await user.save();
        console.log(user, "registered User");

        // Set token as cookie
        setTokenCookie(res, token);

        return res.status(201).json(
            {
                success: true,
                message: "User registered successfully",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};


// ✅ Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        const isMatched = await bcrypt.compare(password, user.password);
        console.log(user, isMatched);

        if (!isMatched) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        const token = generateToken({ id: user._id, email: user.email, role: user.role });
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
        return res.status(500).json({ error: err.message });
    }
};

// ✅ Logout Controller (Clear Cookie)
const logout = (req, res) => {
    try {
        // clears cookies and expires immediately
        res.clearCookie("token");

        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: err.message });
    }

};

const getMe = (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


const sendOtpMail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ success: false, message: "User does not exists." });
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpires = date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;
        await user.save();

        await sendOtpMail(email, otp);
        return res.status(200).json({ success: "true", message: "otp sent successfully" });

    } catch (error) {
        return res.status(500).json(`send otp error ${error}`)
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.resetOtp != otp || user.otpExpires < date.now()) return res.status(400).json({ success: false, message: "invalid or expired otp" });

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "otp verified successfully" })
    } catch (error) {
        return res.status(500).json(`verify otp error ${error}`)
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.isOtpVerified) return res.status(400).json({ success: false, message: "User does not exist." });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.isOtpVerified = false;
        await user.save();
        return res.status(200).json({ success: true, message: "password reset successfully" })

    } catch (error) {
        return res.status(500).json(`reset password error ${error}`)
    }

}


module.exports = {
    register,
    login,
    logout,
    getMe,
    sendOtpMail,
    verifyOtp,
}