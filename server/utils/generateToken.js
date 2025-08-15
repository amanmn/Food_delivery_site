const jwt = require("jsonwebtoken");

const generateToken = (res, user) => {  
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role:user.role
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  
  // ✅ Set token as HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // set to true in production
  });

  return token; // ✅ Return the token so you can send it in response
};

module.exports = { generateToken };
