const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || quantity == null) {
      return res.status(400).json({ success: false, message: "Product ID and quantity are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be greater than zero" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: Number(quantity) }],
      });
      await cart.save();
      await User.findByIdAndUpdate(userId, { cart: cart._id });

    } else {
      const existingItem = cart.items.find(item => item.product.toString() === productId);
      if (existingItem) {
        existingItem.quantity += Number(quantity);
      } else {
        cart.items.push({ product: productId, quantity: Number(quantity) });
      }
    }
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate("items.product");

    res.status(200).json({ success: true, message: "Item added to cart", cart: populatedCart });
  } catch (err) {
    console.error("Error adding item to cart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Example in cart controller:
const getUserCart = async (req, res) => {

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  console.log(cart,">>>carttt");
  if (!cart) {
    return res.status(404).json({ items: [] });
  }

  res.status(200).json(cart);
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = Number(quantity);
    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate("items.product");

    res.status(200).json({ success: true, message: "Cart item updated", cart: updatedCart });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items.pull({ _id: itemId });
    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate("items.product");

    res.status(200).json({ success: true, message: "Cart item removed", cart: updatedCart });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Optional: Clear entire cart (useful during testing)
const clearCart = async (req, res) => {
  try {
    await Cart.deleteOne({ user: req.user.id });
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addToCart,
  getUserCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
};
