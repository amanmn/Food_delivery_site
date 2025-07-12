const express = require("express");
const router = express.Router();
const { placeOrder,getUserOrders } = require("../../controllers/orderController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/my-orders", authMiddleware, getUserOrders);
router.post("/place", authMiddleware, placeOrder);

module.exports = router;
