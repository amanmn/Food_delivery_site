const express = require("express");
const router = express.Router();
const { placeOrder, getMyOrders, updateOrderStatus, getDeliveryBoyAssignment, acceptAssignment, getCutterntOrder, getOrderById, sendDeliveryOtp, verifyDeliveryOtp } = require("../controllers/orderController");
const { verifyToken, deliveryOnly } = require("../middleware/authmiddleware");

router.post("/place-order", verifyToken, placeOrder);
router.get("/orders", verifyToken, getMyOrders);
router.put("/update-status", verifyToken, updateOrderStatus); // owner
router.get("/get-assignments", verifyToken, deliveryOnly, getDeliveryBoyAssignment); // deliveryBoy
router.get("/get-current-order", verifyToken, getCutterntOrder);
router.post("/accept-assignment/:assignmentId", verifyToken, deliveryOnly, acceptAssignment); // deliveryBoy
router.post("/send-delivery-otp", verifyToken, deliveryOnly, sendDeliveryOtp); // deliveryBoy
router.post("/verify-delivery-otp", verifyToken, deliveryOnly, verifyDeliveryOtp); // deliveryBoy
router.get("/get-order-by-id/:orderId", verifyToken, getOrderById); // deliveryBoy


module.exports = router;
