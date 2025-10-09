const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.SECRET_KEY;

const unauthorized = (res, msg = 'Not authenticated') => res.status(401).json({ success: false, message: msg });

const verifyToken = async (req, res, next) => {
  let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];;
  console.log("token", token);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verify error:', err);
      return unauthorized(res, 'No token provided');
    }

    const user = await User.findById(decoded.id)
      .select("-password -__v -refreshToken");
    console.log(user);

    if (!user) return unauthorized(res, 'User not found');

    if (user.passwordChangedAt && decoded.iat) {
      const pwdChangedTimestamp = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (decoded.iat < pwdChangedTimestamp) {
        return unauthorized(res, 'Token no longer valid (password changed)');
      }
    }

    req.user = user || null; // now req.user.role will be available
    next();

  } catch (error) {
    req.user = null;
    next();
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user) return unauthorized(res, 'Not authenticated');
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    return next();
  } catch (error) {
    console.error('requireRole error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}


// verify admin middleware
const adminOnly = requireRole('admin');

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
  adminOnly
};
