const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const populateUser = require("../utils/populateUser");
const Shop = require("../models/shopmodel");

//  POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    const userId = cartItems.user;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "cart items is empty" });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Incomplete delivery address" });
    }

    const groupItemsByShop = {}

    for (const item of cartItems.items) {
      const shopId = item?.product?.shop;
      if (!shopId) {
        console.error("Missing shop ID in item:", item);
        return res.status(400).json({
          success: false,
          message: "One or more items are missing shop information.",
        });
      }

      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    }

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) return res.status(400({ success: false, message: "shop no found" }))
        const items = groupItemsByShop[shopId];

        const subtotal = items.reduce((sum, i) => {
          return sum + Number(i.product.price) * Number(i.quantity);
        }, 0);

        return {
          shop: shop._id,
          owner: shop.owner?._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.product._id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          }))
        }
      }));


    const newOrder = await Order.create({
      user: userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { orders: newOrder._id } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      newOrder,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ success: false, message: `place order error ${err}` });
  }
};


const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    // console.log(user);
    
    if (user.role === "user") {
      // console.log("user");

      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email phone")
        .populate("shopOrders.shopOrderItems.item", "name image price")

      if (!orders) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({
        success: true,
        orders,
      })
    } else if (user.role === "owner") {
      // console.log("owner");

      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")

      // console.log(orders, "owner orders");

      if (!orders) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({
        success: true,
        orders,
      });
    }
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const ownerId = req.userId;
    console.log(req.body);
    
    if (!orderId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID and status are required" });
    }

    const order = await Order.findOne({
      _id: orderId,
      "shopOrders.owner": ownerId,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or unauthorized" });
    }

    order.orderStatus = status;
    await order.save();

    if (req.io) {
      req.io.emit("orderUpdated", { orderId, status });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = {
  placeOrder,
  getMyOrders,
  updateOrderStatus
};
