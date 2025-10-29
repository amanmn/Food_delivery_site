const express = require("express");
const router = express.Router();
const { placeOrder, getUserOrders } = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authmiddleware");

router.get("/orders", verifyToken, getUserOrders);
router.post("/place-order", verifyToken, placeOrder);

module.exports = router;
