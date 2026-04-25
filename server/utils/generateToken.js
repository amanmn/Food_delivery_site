const jwt = require("jsonwebtoken");

// Generate Tokens
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

// ✅ Set token as HTTP-only cookie
const setTokenCookie = (res, token, name) => {
  res.cookie(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: name === "accessToken"
      ? 15 * 60 * 1000       // 15 min
      : 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

module.exports = { generateAccessToken, generateRefreshToken, setTokenCookie };
