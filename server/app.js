const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const cors = require("cors");
require("dotenv").config();
const mongoose = require('./config/db')();

// mongoose.connect();
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const routes = require("./routes/userRoutes/userRoutes");
const cartRoutes = require("./routes/cartRoutes/cartRoutes");
const productRoutes = require("./routes/productRoutes/");
// const orderRoutes = require("./routes/orderRoutes/orderRoutes");

app.use("/user",routes);
// app.use("/product",productRoutes);
app.use("/cart",cartRoutes);
// app.use("/orders", orderRoutes);



// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
