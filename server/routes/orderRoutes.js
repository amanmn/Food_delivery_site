const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authmiddleware"); // Middleware to check if user is logged in
const { placeOrder } = require("../controllers/orderController");

router.post("/place",authMiddleware,placeOrder);

module.exports = router;