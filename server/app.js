const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cookieParser());

const mongoose = require('./config/db.js')();

// mongoose.connect();
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true,
  }));


// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const routes = require("./routes/userRoutes/userRoutes");
const cartRoutes = require("./routes/cartRoutes/cartRoutes");
const productRoutes = require("./routes/productRoutes/productRoute.js");
const orderRoutes = require("./routes/orderRoutes");
const mapRoutes = require("./routes/mapRoutes.js"); 

app.use("/user",routes);
app.use("/product",productRoutes);
app.use("/cart",cartRoutes);
app.use("/order", orderRoutes);
app.use("/map", mapRoutes); 


// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
