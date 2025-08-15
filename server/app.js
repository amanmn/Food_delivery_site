const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const BASEURL = require("./config/URI.js");
const app = express();
app.use(express.json());
app.use(cookieParser());

const mongoose = require('./config/db.js')();

// mongoose.connect();
app.use(
  cors({
    origin: BASEURL, // frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  }));


// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const authRoutes = require("./routes/authRoute.js");
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoute.js");
const cartRoutes = require("./routes/cartRoutes.js");
const productRoutes = require("./routes/productRoute.js");
const orderRoutes = require("./routes/orderRoutes");
const mapRoutes = require("./routes/mapRoutes.js");


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/map", mapRoutes);


// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
