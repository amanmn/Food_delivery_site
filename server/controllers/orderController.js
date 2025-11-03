const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const populateUser = require("../utils/populateUser");

//  POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, totalAmount, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items to order" });
    }

    const newOrder = new Order({
      user: userId,
      items,
      totalAmount,
      deliveryAddress: address,
      status: "Pending",
    });

    const savedOrder = await newOrder.save();

    await User.findByIdAndUpdate(userId, {
      $push: { orders: savedOrder._id },
    });

    await Cart.findOneAndDelete({ user: userId });

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc   Get all orders of a user
// @route  GET /api/orders
// @access Private
const getUserOrders = async (req, res) => {
  try {
    const userWithOrders = await User.findById(req.user.id)
      .populate(populateUser);

    if (!userWithOrders) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      orders: userWithOrders.orders,
    });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
};
