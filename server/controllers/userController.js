const jwt = require("jsonwebtoken");
const User = require("../models/User");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const populateUser = require("../utils/populateUser"); // if using helper

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
            user: req.user,
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
        // address 
        if (
            Array.isArray(address) &&
            address.length > 0 &&
            Object.values(address[0]).every(value => value && value.trim() !== "")
        ) {
            updateFields.address = address;

        } if (profilePicture) updateFields.profilePicture = profilePicture;

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
    cloudinaryImg,
    profile,
    updateUser,
    upload,
};
