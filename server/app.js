require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const BASEURL = require("./config/URI.js");
const passport = require('passport');
// const session = require('express-session');

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
    ],
    credentials: true,
  }));


// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production', // set true in prod on HTTPS
//     httpOnly: true,
//     sameSite: 'lax',
//   }
// }));

require('./config/googleOAuth2.js')
app.use(passport.initialize());
// app.use(passport.session());

require('./config/db.js')();


// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const authRoutes = require("./routes/authRoute.js");
const googleOAuth = require("./routes/googleOAuth.js");
const userRoutes = require("./routes/userRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes");
const mapRoutes = require("./routes/mapRoutes.js");
const shopRoutes = require("./routes/shopRoute.js");
const itemRoutes = require("./routes/itemRoutes.js")

app.use("/api/auth", authRoutes);
app.use("/", googleOAuth);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/map", mapRoutes);

app.use("/api/shop", shopRoutes);
app.use("/api/item", itemRoutes);


// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
