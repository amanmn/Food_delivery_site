const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // console.log("token");
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


// verify admin middleware
const adminOnly = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};



module.exports = {
  verifyToken,
  adminOnly
};
