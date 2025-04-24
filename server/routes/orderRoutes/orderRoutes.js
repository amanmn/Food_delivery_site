const express = require("express");
const router = express.Router();
const { placeOrder } = require("../../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware"); // Middleware to check if the user is logged in

// POST route to place an order
router.post("/place", authMiddleware, placeOrder);

module.exports = router;
