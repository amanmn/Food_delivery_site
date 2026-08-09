const express = require("express");
const router = express.Router();
const {
  addToCart,
  getUserCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} = require("../controllers/cartController");

const { verifyToken, requireAuth } = require("../middleware/authmiddleware");

// Routes
router.get("/get", verifyToken, requireAuth, getUserCart);
router.post("/add", verifyToken, requireAuth, addToCart);
router.patch("/update/:itemId", verifyToken, requireAuth, updateCartItem);
router.delete("/delete/:itemId", verifyToken, requireAuth, deleteCartItem);

// Optional test route to clear cart
router.delete("/clear", verifyToken, requireAuth, clearCart);

module.exports = router;
