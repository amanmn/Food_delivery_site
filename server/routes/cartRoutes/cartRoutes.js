const express = require("express");
const router = express.Router();
const {
  addToCart,
  getUserCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} = require("../../controllers/cartController");

const authMiddleware = require("../../middleware/authMiddleware");

// Routes
router.get("/get", authMiddleware, getUserCart);
router.post("/add", authMiddleware, addToCart);
router.patch("/update/:itemId", authMiddleware, updateCartItem);
router.delete("/delete/:itemId", authMiddleware, deleteCartItem);

// Optional test route to clear cart
router.delete("/clear", authMiddleware, clearCart);

module.exports = router;
