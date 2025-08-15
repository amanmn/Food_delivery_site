const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");


// ✅ Register Controller
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        // console.log(user);

        await user.save();
        // console.log(user, "registered User");

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        
        const existingUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
        // console.log(existingUser);

        const token = generateToken(res, existingUser);

        // 5. Send response
        res.status(200).json({
            success: true,
            message: "Login successfully",
            user: existingUser,
            token
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Logout Controller (Clear Cookie)
const logout = (req, res) => {
    console.log("logout hit");

    // clears cookies and expires immediately
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
    register,
    login,
    logout
}