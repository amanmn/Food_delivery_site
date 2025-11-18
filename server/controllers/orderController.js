const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const populateUser = require("../utils/populateUser");
const Shop = require("../models/shopmodel");
const DeliveryAssignment = require("../models/deliveryAssignment");

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
    const { orderId, shopOrderId, status } = req.body;
    const ownerId = req.userId;

    if (!orderId || !shopOrderId || !status) {
      return res.status(400).json({ success: false, message: "Order ID, shopOrder ID and status are required" });
    }

    const order = await Order.findOne({ _id: orderId, "shopOrders.owner": ownerId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found or unauthorized" });

    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!shopOrder) return res.status(404).json({ success: false, message: "Shop order not found" });


    shopOrder.status = status;
    await order.save();


    let deliveryBoysPayload = [];

    if (status === "out_for_delivery") {
      const { longitude, latitude } = order.deliveryAddress;
      // console.log(order.deliveryAddress, "location")

      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
            $maxDistance: 5000
          }
        }
      });

      const nearByIds = nearByDeliveryBoys.map(boy => boy._id);
      // console.log(nearByIds, "nnnnnnnn");

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] }
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map(id => String(id)));
      const availableDeliveryBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));

      console.log("availableDeliveryBoys", availableDeliveryBoys);


      const candidates = availableDeliveryBoys.map(b => b._id);
      console.log(candidates, "candidates");

      if (candidates.length > 0) {
        const deliveryAssignment = await DeliveryAssignment.create({
          order: order._id,
          shop: shopOrder.shop,
          shopOrderId: shopOrder._id,
          broadcastedTo: candidates,
          status: "broadcasted"
        });

        // For now, assignedDeliveryBoy stays null until someone accepts
        shopOrder.assignment = deliveryAssignment;

        deliveryBoysPayload = availableDeliveryBoys.map(boy => ({
          id: boy._id,
          fullName: boy.fullName || boy.name,
          longitude: boy.location.coordinates?.[0],
          latitude: boy.location.coordinates?.[1],
          phone: boy.phone
        }));
      }
    }
    shopOrder.availableBoys = deliveryBoysPayload;
    await order.save();
    const updatedOrder = await order.populate([
      { path: "shopOrders.shop", select: "name" },
      { path: "shopOrders.assignedDeliveryBoy", select: "fullName email phone" },

      {
        path: "shopOrders.assignment",
        populate: [
          { path: "broadcastedTo", select: "fullName name email phone profilePicture location" },
          { path: "assignedTo", select: "fullName name email phone profilePicture location" }
        ]
      }
    ]);


    const updatedShopOrder = order.shopOrders.id(shopOrderId);

    res.status(200).json({
      success: true,
      message: "Order status updated",
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment,
      order: updatedOrder
    });

  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ success: false, message: "order status error" });
  }
};

const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted"
    })
      .populate("order")
      .populate("shop")
    console.log(assignments, "assignments");

    const formated = assignments.map(a => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items: a.order.shopOrders.find(shopOrder => shopOrder._id == a.shopOrderId).shopOrderItems || [],
      subtotal: a.order.shopOrders.find(shopOrder => shopOrder._id == a.shopOrderId)?.subtotal
    }))

    console.log(formated, "formated");


    return res.status(200).json(formated);
  } catch (error) {
    res.status(500).json({ success: false, message: "get Assignment error" });
  }
}

module.exports = {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  getDeliveryBoyAssignment
};
