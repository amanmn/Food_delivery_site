const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
const { generateAccessToken, generateRefreshToken, setTokenCookie } = require("../utils/generateToken");
const sendOtpNodeMailer = require("../utils/nodemailer.js");
const redisClient = require("../config/redis.js");

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

        const accessToken = generateAccessToken({ id: user._id });
        const refreshToken = generateRefreshToken({ id: user._id });
        setTokenCookie(res, accessToken);
        setTokenCookie(res, refreshToken);

        // Return response
        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            token: accessToken,
            refreshToken: refreshToken,
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

        const accessToken = generateAccessToken({ id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user._id });

        // store refresh token in redis
        await redisClient.setEx(`refreshToken:${user._id}`, refreshToken, 7 * 24 * 60 * 60); // expires in 7 days

        setTokenCookie(res, accessToken);
        setTokenCookie(res, refreshToken);

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
            token: accessToken,
            refreshToken: refreshToken,
        });

    } catch (err) {
        return handleServerError(res, err, "Login failed");
    }
};

const refreshToken = async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_SECRET);
        const storedToken = await redisClient.get(`refreshToken:${decoded.id}`);

        if (!storedToken || storedToken !== oldRefreshToken) {
            return res.status(403).json({ success: false, message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken({ id: decoded.id });
        const newRefreshToken = generateRefreshToken({ id: decoded.id });

        // replace old refresh token in redis
        await redisClient.setEx(`refreshToken:${decoded.id}`, newRefreshToken, 7 * 24 * 60 * 60); // update refresh token in redis
        setTokenCookie(res, newAccessToken);
        setTokenCookie(res, newRefreshToken);
        
        return res.json({ success: true });

    } catch (err) {
        return handleServerError(res, err, "Token refresh failed");
    }
}

const logout = (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
            await redisClient.del(`refreshToken:${decoded.id}`);
        } catch (err) {
            console.error("Error during logout token verification:", err.message);
        }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ success: true, message: "Logged out successfully" });

};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("orders")
            .select("-password");
        // const user = req.user;
        // console.log("user:", user);
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return handleServerError(res, error, "Failed to fetch user data");
    }
};

const sendOtpMail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User does not exists." });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const hashedOtp = await bcrypt.hash(otp, 10);
        user.resetOtp = hashedOtp;
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
        return handleServerError(res, error, "Send OTP failed");
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user || user.otpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or invalid"
            });
        }

        const isValid = await bcrypt.compare(otp, user.resetOtp);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully.   "
        });
    } catch (error) {
        return handleServerError(res, error, "Verify OTP failed");
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
        return handleServerError(res, error, "Reset password failed");
    }
}

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    sendOtpMail,
    verifyOtp,
    resetPassword,
}