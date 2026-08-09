const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Item = require("../models/Itemmodel");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer"
      });
    }

    const product = await Item.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [
          {
            product: productId,
            quantity: Number(quantity)
          }
        ]
      });

      await User.findByIdAndUpdate(userId, {
        cart: cart._id
      });
    } else {
      const existingItem = cart.items.find(
        item => item.product.toString() === productId.toString()
      );

      if (existingItem) {
        existingItem.quantity += Number(quantity);
      } else {
        cart.items.push({
          product: productId,
          quantity: Number(quantity)
        });
      }
      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product");

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: populatedCart
    });

  } catch (err) {
    console.error("Error adding item to cart:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Example in cart controller:
const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .populate({
        path: "user",
        select: "name address phone",
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      cart
    });

  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID"
      });
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer"
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    item.quantity = Number(quantity);
    await cart.save();

    const updatedCart = await Cart.findById(cart._Id)
      .populate("items.product");

    res.status(200).json({
      success: true,
      message: "Cart item updated",
      cart: updatedCart
    });

  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID"
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    cart.items.pull(itemId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.product");

    res.status(200).json({
      success: true,
      message: "Cart item removed",
      cart: updatedCart
    });

  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Optional: Clear entire cart (useful during testing)
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    await Cart.findOneAndDelete({
      user: userId,
    });

    await User.findByIdAndUpdate(userId, {
      $unset: { cart: "" },
    });

    return res.status(200).json({
      success: true,
      message: "Cart cleared"
    });
  } catch (error) {
    console.error("Error clearing cart:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  addToCart,
  getUserCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
};
