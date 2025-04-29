const express = require("express");
const router = express.Router();
const { placeOrder } = require("../../controllers/orderController");
const authMiddleware = require("../../middleware/authmiddleware"); // Middleware to check if the user is logged in

router.post("/place", authMiddleware, placeOrder);

module.exports = router;
