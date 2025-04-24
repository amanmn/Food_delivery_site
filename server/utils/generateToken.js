const jwt = require("jsonwebtoken");

const generateToken = (res, user) => {
  const token = jwt.sign({ id: user._id }, process.env.SECRET_key, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // set to true in production
  });

  return token; // ✅ Return the token so you can send it in response
};

module.exports = { generateToken };
