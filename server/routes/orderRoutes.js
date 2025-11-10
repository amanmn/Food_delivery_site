const express = require("express");
const router = express.Router();
const { placeOrder, getMyOrders, updateOrderStatus } = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authmiddleware");

router.post("/place-order", verifyToken, placeOrder);
router.get("/orders", verifyToken, getMyOrders);
router.put("/update-status", verifyToken, updateOrderStatus);

module.exports = router;
