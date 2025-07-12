const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { generateToken } = require("../utils/generateToken");

const populateUser = require("../utils/populateUser"); // if using helper

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
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        console.log(user);
        

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

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        user.password = undefined;
        const token = generateToken(res, user);

        // ✅ 4. Set token as HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true only in production with HTTPS
            sameSite: "lax", // or "none" if using HTTPS and cross-origin
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // 5. Send response
        res.status(200).json({
            success: true,
            message: "Login successful",
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

// ✅ Logout Controller (Clear Cookie)
const logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logged out successfully" });
};

// ✅ Multer + Cloudinary Setup
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "profile-pictures",
        allowed_formats: ["jpg", "jpeg", "png"],
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// ✅ Cloudinary Image Upload
const cloudinaryImg = async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        res.status(200).json({ imageUrl: req.file.path });
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        res.status(500).json({ error: "Failed to upload image" });
    }
};

// ✅ Get Profile
const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate(populateUser);   // populates cart and orders

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Update Profile
const updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, address, profilePicture, newAddress } = req.body;

        const updateOps = {};

        // Add basic fields to $set
        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;
        if (address) updateFields.address = address;
        if (profilePicture) updateFields.profilePicture = profilePicture;
        if (Object.keys(updateFields).length > 0) {
            updateOps.$set = updateFields;
        }

        // Add new address to $push
        if (newAddress) {
            updateOps.$push = { address: newAddress };
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateOps,
            { new: true, runValidators: true }
        ).select("-password");
        console.log(updatedUser);


        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Exports
module.exports = {
    register,
    login,
    logout,
    cloudinaryImg,
    profile,
    updateUser,
    upload,
};
