const express = require("express");
const router = express.Router();
const { placeOrder, getUserOrders } = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/my-orders", verifyToken, getUserOrders);
router.post("/place", verifyToken, placeOrder);

module.exports = router;
