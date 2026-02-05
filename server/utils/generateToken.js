const jwt = require("jsonwebtoken");

// ✅ Generate JWT Token
const generateToken = (payload) => {

  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
};

// ✅ Set token as HTTP-only cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
};

module.exports = { generateToken, setTokenCookie };
