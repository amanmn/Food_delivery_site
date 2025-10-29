const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.SECRET_KEY;

const unauthorized = (res, msg = 'Not authenticated') => res.status(401).json({ success: false, message: msg });

const verifyToken = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];;

    if (!token) {
      return unauthorized(res, "No token provided")
    }

    // verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id;
    } catch (error) {
      return unauthorized(res, "Invalid or expired token");
    }

    const user = await User.findById(decoded.id)
      .select("-password -__v -refreshToken");
    // console.log(user);

    if (!user) return unauthorized(res, 'User not found');

    if (user.passwordChangedAt && decoded.iat) {
      const pwdChangedTimestamp = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (decoded.iat < pwdChangedTimestamp) {
        return unauthorized(res, 'Token no longer valid (password changed)');
      }
    }

    req.user = user // || null; // now req.user.role will be available
    next();

  } catch (error) {
    console.error("verifyToken error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user) return unauthorized(res, 'Not authenticated');

    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Access Denied: Insufficient permissions' });
    // console.log(req.user);

    return next();
  } catch (error) {
    console.error('requireRole error:', err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


// specific role middleware
const ownerOnly = requireRole("owner");
const deliveryOnly = requireRole("deliveryboy");
// const userOnly = requireRole("user");


// const adminOnly = () => (req, res, next) => {
//   try {
//     if (!req.user) return unauthorized(res, 'No token provided');

//     if (req.user.role !== "admin") {
//       return res.status(403).json({ success: false, message: "Admin access only" });
//     }
//     next();
//   } catch (err) {
//     return res.status(500).json({ success: false, message: "internal server error" });
//   }
// };

module.exports = {
  verifyToken,
  requireRole,
  ownerOnly,
  deliveryOnly
};
