const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.ACCESS_SECRET;

const unauthorized = (res, msg = 'Not authenticated') => res.status(401).json({ success: false, message: msg });

const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null; // no token, proceed as guest
      return next();
    }

    // verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);

      if (!decoded?.id) {
        req.user = null;
        return next();
      }
      req.userId = decoded.id;
    } catch (error) {
      return unauthorized(res, "Invalid or expired token");
    }

    if (!decoded?.id) {
      return unauthorized(res, "Invalid token payload");
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
    req.userId = user._id;
    next();

  } catch (error) {
    console.error("🔥 verifyToken fatal error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// check 401 for token rotation( old refresh -> new tokens )
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  next();
};


const requireRole = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user) return unauthorized(res, 'Not authenticated');

    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Access Denied: Insufficient permissions' });

    return next();
  } catch (error) {
    console.error('requireRole error:', error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


// specific role middleware
const ownerOnly = requireRole("owner");
const deliveryOnly = requireRole("deliveryBoy");
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
  requireAuth,
  requireRole,
  ownerOnly,
  deliveryOnly
};
