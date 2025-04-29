const express = require("express");
const router = express.Router();
const { addToCart, getUserCart, updateCartItem } = require("../../controllers/cartController");
const authMiddleware = require("../../middleware/authmiddleware"); // Middleware to check if user is logged in

router.get("/get", authMiddleware,getUserCart);
router.post("/add", authMiddleware, addToCart);
router.patch("/update/:itemId", authMiddleware, updateCartItem);

module.exports = router;
