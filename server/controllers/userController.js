const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/generateToken")
const User = require("../models/User");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body);
        // Validate input fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // 🔍 Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // 🔒 Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🆕 Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // ✅ Send response
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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // ❌ Validate input fields
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // 🔍 Check if user exists
        const user = await User.findOne({ email }).select("+password"); // Fetch password to compare
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // 🔑 Compare password using bcrypt
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

         // After comparing password, fetch user again without password
         const userWithoutPassword = await User.findOne({ email }).select("-password");

        // JWT setUp
        const token = generateToken(res, userWithoutPassword); // ✅ capture the returned token

        res.status(200).json({
            success: true,
            message: `Welcome ${userWithoutPassword.name} `,
            token, // ✅ Now it's defined
            user:userWithoutPassword,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profile-pictures",
        allowed_formats: ["jpg", "jpeg", "png"],
    },
});
const upload = multer({ storage });

const cloudinaryImg = (req, res) => {
    try {
        res.status(200).json({ imageUrl: req.file.path }); // Cloudinary returns the image URL
    } catch (err) {
        res.status(500).json({ error: "Failed to upload image" });
    }
}

const profile = async (req, res) => {
    try {
        const useremail = req.user.email;
        console.log(useremail);
        const user = await User.findOne(useremail);
        console.log(useremail);

    } catch (error) {

    }
}

const updateUser = async (req, res) => {
    try {
        console.log(req.body,"body");
        
        const { userId, newAddress } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { address: newAddress } },  // address is correct here
            { new: true },
        );
        console.log("updatedUser:", user);

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


module.exports = {
    register,
    login,
    cloudinaryImg,
    profile,
    updateUser,
    upload,
};