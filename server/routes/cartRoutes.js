const express = require("express");
const router = express.Router();
const {
  addToCart,
  getUserCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} = require("../controllers/cartController");

const { verifyToken } = require("../middleware/authmiddleware");

// Routes
router.get("/get", verifyToken, getUserCart);
router.post("/add", verifyToken, addToCart);
router.patch("/update/:itemId", verifyToken, updateCartItem);
router.delete("/delete/:itemId", verifyToken, deleteCartItem);

// Optional test route to clear cart
router.delete("/clear", verifyToken, clearCart);

module.exports = router;
