const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ Add this

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.id).select("-password"); // ✅ Get full user

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // ✅ Now you can use req.user.id, req.user.name, etc.    
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
