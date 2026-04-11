const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const mongoose = require("mongoose");
const populateUser = require("../utils/populateUser");
const Shop = require("../models/shopmodel");
const DeliveryAssignment = require("../models/deliveryAssignment");
const { model } = require("mongoose");
const { sendDeliveryOtpMail } = require("../utils/nodemailer");
const crypto = require("crypto");

const Razorpay = require("razorpay");
const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.Test_API_Key,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


//  POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    const userId = cartItems.user;

    if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
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
        if (!shop) throw new Error("Shop not found");

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

    // razorpay order -- online method
    if (paymentMethod === "online") {
      const razorOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      })

      const newOrder = await Order.create({
        user: userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: razorOrder.id,
        payment: false,
      });

      // const updatedUser = await User.findByIdAndUpdate(
      //   userId,
      //   { $push: { orders: newOrder._id } },
      //   { new: true }
      // );

      return res.status(200).json({
        success: true,
        razorOrder,
        orderId: newOrder._id,
        razorpayOrderId: razorOrder.id
      });
    }

    // For COD, directly create the order without Razorpay
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
    // Remove user's Cart now that the order was placed
    try {
      await Cart.findOneAndDelete({ user: userId });
      await User.findByIdAndUpdate(userId, { $unset: { cart: "" } });
    } catch (err) {
      console.error("Error clearing cart after order:", err);
    }

    // Emit real-time update to the shop owner about the new order
    const io = req.app.get("io");

    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerId = shopOrder.owner?._id || shopOrder.owner;

        if (ownerId) {
          io.to(String(ownerId)).emit("newOrder", {
            orderId: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
            payment: newOrder.payment,
            message: "You have a new order!",
          });

          io.to(String(ownerId)).emit("dashboardUpdate");
        }
      });
    }


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

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    console.log("verifyPayment called with:", req.body);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.payment = true;
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentVerifiedAt = new Date();

    await order.save();

    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name");

    const userId = order.user;
    try {
      await Cart.findOneAndDelete({ user: userId });
      await User.findByIdAndUpdate(userId, { $unset: { cart: "" } });
    } catch (err) {
      console.error("Error clearing cart after online payment:", err);
    }

    const io = req.app.get("io");

    if (io) {
      await order.populate("shopOrders.shop");
      await order.populate("user");

      order.shopOrders.forEach((shopOrder) => {
        const ownerId = shopOrder.owner?._id || shopOrder.owner;

        if (ownerId) {
          io.to(String(ownerId)).emit("newOrder", {
            orderId: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment,
          });

          io.to(String(ownerId)).emit("dashboardUpdate");
        }
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, message: "verify payment error" });
  }
}

const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const skip = (page - 1) * limit;

    if (user.role === "user") {

      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate({
          path: "shopOrders",
          populate: [
            { path: "shop", select: "name" },
            { path: "shopOrderItems.item", select: "name image price" },
            { path: "assignedDeliveryBoy", select: "fullName email phone latitude longitude " },
            {
              path: "assignment",
              populate: [
                { path: "broadcastedTo", select: "fullName phone location" },
                { path: "assignedTo", select: "fullName phone location" }
              ]
            }
          ]
        })
        .populate("user");

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

      const orders = await Order.find({
        "shopOrders.owner": new mongoose.Types.ObjectId(req.userId),
        $or: [
          { paymentMethod: "cod" },        // ✅ show COD
          { paymentMethod: "online", payment: true } // ✅ only paid online
        ]
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "shopOrders",
          populate: [
            { path: "shop", select: "name" },
            { path: "shopOrderItems.item", select: "name image price" },
            {
              path: "assignedDeliveryBoy",
              select: "name email phone location"
            },
            {
              path: "assignment",
              populate: [
                { path: "broadcastedTo", select: "name phone location" },
                { path: "assignedTo", select: "name phone location" }
              ]
            }
          ]
        })
        .populate("user");

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
}

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopOrderId, status } = req.body;
    const ownerId = req.userId;

    if (!orderId || !shopOrderId || !status) {
      return res.status(400).json({ success: false, message: "Order ID, shopOrder ID and status are required" });
    }

    const order = await Order.findOne({
      _id: orderId,
      "shopOrders.owner": ownerId
    });

    if (!order) return res.status(404).json({
      success: false,
      message: "Order not found or unauthorized"
    });

    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!shopOrder) return res.status(404).json({ success: false, message: "Shop order not found" });

    shopOrder.status = status;
    await order.save();

    let deliveryBoysPayload = [];

    if (status === "out_for_delivery") {
      const { longitude, latitude } = order.deliveryAddress || {};
      // Validate coordinates exist and are numbers
      const lonNum = Number(longitude);
      const latNum = Number(latitude);

      if (Number.isFinite(lonNum) && Number.isFinite(latNum)) {
        try {
          const nearByDeliveryBoys = await User.find({
            role: "deliveryBoy",
            location: {
              $near: {
                $geometry: { type: "Point", coordinates: [lonNum, latNum] },
                $maxDistance: 5000
              }
            }
          });

          const nearByIds = nearByDeliveryBoys.map(boy => boy._id);

          const busyIds = await DeliveryAssignment.find({
            assignedTo: { $in: nearByIds },
            status: { $ne: "completed" }
          }).distinct("assignedTo");

          const busyIdSet = new Set(busyIds.map(id => String(id)));
          const availableDeliveryBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));

          console.log("availableDeliveryBoys", availableDeliveryBoys);

          const candidates = availableDeliveryBoys.map(b => b._id);
          console.log("Broadcasting to:", candidates);

          if (candidates.length > 0) {
            const deliveryAssignment = await DeliveryAssignment.create({
              order: order._id,
              shop: shopOrder.shop,
              shopOrderId: shopOrder._id,
              broadcastedTo: candidates,
              status: "broadcasted"
            });

            // Assign the assignment id to the shopOrder (store ObjectId instead of full doc)
            shopOrder.assignment = deliveryAssignment._id;

            const io = req.app.get("io");

            if (io && candidates.length > 0) {
              candidates.forEach((boyId) => {
                io.to(String(boyId)).emit("newBroadcastOrder", {
                  assignmentId: deliveryAssignment._id,
                  orderId: order._id,
                  shopOrderId: shopOrder._id,
                  shopName: shopOrder.shop,
                  deliveryAddress: order.deliveryAddress,
                  status: "broadcasted",
                });
              });
            }

            deliveryBoysPayload = availableDeliveryBoys.map(boy => ({
              id: String(boy._id),
              fullName: boy.fullName || boy.name,
              longitude: boy.location?.coordinates?.[0],
              latitude: boy.location?.coordinates?.[1],
              phone: boy.phone
            }));
          }
        } catch (err) {
          console.error("Error finding/creating delivery assignment:", err);
        }
      } else {
        console.warn("Invalid delivery coordinates for order", order._id, order.deliveryAddress);
      }
    }

    shopOrder.availableBoys = deliveryBoysPayload;
    // console.log("Updated Shop Order before saving:", shopOrder);
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
      },
      { path: "user", select: "socketId" }
    ]);

    const updatedShopOrder = order.shopOrders.id(shopOrderId);
    console.log("Updated Shop Order:", updatedShopOrder);

    const io = req.app.get("io");
    if (io) {
      // emit update to user
      const userSocketId = updatedOrder.user?.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("orderStatusUpdated", {
          orderId: updatedOrder._id,
          shopOrderId: updatedShopOrder._id,
          status: updatedShopOrder.status,
          userId: updatedOrder.user._id
        });
      }

      // emit update to shop owner
      const ownerId = updatedShopOrder.owner;

      if (ownerId) {
        io.to(String(ownerId)).emit("orderStatusUpdated", {
          orderId: updatedOrder._id,
          shopOrderId: updatedShopOrder._id,
          status: updatedShopOrder.status,
        });
      }

      io.to(String(ownerId)).emit("dashboardUpdate");
    }


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
    const deliveryBoyObjectId = new mongoose.Types.ObjectId(deliveryBoyId);
    console.log("dboid", deliveryBoyObjectId);


    const assignments = await DeliveryAssignment.find({
      $or: [
        {
          broadcastedTo: deliveryBoyObjectId,
          status: "broadcasted"
        },
        {
          assignedTo: deliveryBoyObjectId,
          status: { $in: ["assigned"] }
        }
      ]
    })
      .populate("order")
      .populate("shop");

    // console.log(assignments, "assignments");
    const validAssignments = assignments.filter(a => a.order);

    const formated = validAssignments.map(a => {
      if (!a.order) {
        console.log("❌ Missing order in assignment:", a._id);
        return null;
      }

      const shopOrder = a.order?.shopOrders?.find(
        (shopOrder) => String(shopOrder._id) === String(a.shopOrderId)
      );

      return {
        assignmentId: a._id,
        orderId: a.order?._id,
        shopOrderId: a.shopOrderId,
        shopName: a.shop?.name || "N/A",
        deliveryAddress: a.order?.deliveryAddress,
        items: shopOrder?.shopOrderItems || [],
        subtotal: shopOrder?.subtotal || 0,
        status: a.status,
      };
    }).filter(Boolean); // Remove nulls

    return res.status(200).json(formated);
  } catch (error) {
    return res.status(500).json({ success: false, message: "get Assignment error" });
  }
}

const acceptAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId)
    // console.log("assignment to accept", assignment);


    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    if (assignment.status !== "broadcasted") {
      return res.status(400).json({ message: "Assignment is expired" })
    }

    if (!assignment.broadcastedTo.includes(req.userId)) {
      return res.status(403).json({
        message: "You are not eligible for this order"
      });
    }

    const alreadyAssignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    })

    if (alreadyAssignment) {
      return res.status(400).json({ message: "You already have assigned to another order" })
    }

    // prevent second acceptance
    const updated = await DeliveryAssignment.findOneAndUpdate(
      {
        _id: assignmentId,
        status: "broadcasted"
      },
      {
        assignedTo: req.userId,
        status: "assigned",
        acceptedAt: new Date()
      },
      { new: true }
    );

    console.log("Updated Assignment after acceptance:", updated);

    if (!updated) {
      return res.status(400).json({
        message: "Order already accepted by someone else"
      });
    }
    // assignment.broadcastedTo = [req.userId];
    // await assignment.save();

    const order = await Order.findById(assignment.order)
    if (!order) return res.status(400).json({ message: "order not found" })

    const shopOrder = order.shopOrders.find(
      so => String(so._id) === String(updated.shopOrderId)
    );

    shopOrder.assignedDeliveryBoy = req.userId
    console.log(shopOrder.assignedDeliveryBoy, "assignedDeliveryBoy");
    shopOrder.status = "out_for_delivery";

    await order.save()
    const updatedShopOrder = await Order.findById(order._id)
      .populate("shopOrders.assignedDeliveryBoy", "fullName phone");

    const io = req.app.get("io");
    const ownerId = updatedShopOrder.owner;

    if (io) {
      if (ownerId) {
        io.to(String(ownerId)).emit("orderStatusUpdated", {
          orderId: order._id,
          shopOrderId: updatedShopOrder._id,
          assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy,
          status: updatedShopOrder.status,
          assignedDeliveryBoy: { _id: req.userId },
        });
      }
      assignment.broadcastedTo.forEach((boyId) => {
        if (String(boyId) !== String(req.userId)) {
          io.to(String(boyId)).emit("assignmentCancelled", {
            assignmentId: assignment._id
          });
        }
      });
      io.to(String(ownerId)).emit("dashboardUpdate");
    }

    return res.json({
      success: true,
      message: "Assignment accepted",
      assignmentId,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "accept Assignment error" });
  }
}

const getCutterntOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $in: ["assigned"] }
        .populate("shop", "name")
        .populate("assignedTo", "name phone location")
        .populate({
          path: "order",
          populate: [{ path: "user", select: "name email phone location", }]
        })
    })

    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" })
    }
    if (!assignment.order) {
      return res.status(400).json({ message: "order not found" })
    }

    const shopOrder = assignment.order.shopOrders.find(so => String(so._id) === String(assignment.shopOrderId))

    if (!shopOrder) {
      return res.status(400).json({ message: "shopOrder not found" })
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length === 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      assignmentId: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: "get Current Order error" });
  }
}

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("orderId", orderId);

    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User"
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item"
      })
      .lean()

    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ success: false, message: "get Order By Id error" });
  }
}

const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    console.log(req.body, "sendDeliveryOtp");

    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!order || !shopOrder) {
      return res.status(400).json({ message: "Enter valid orderId or shopOrderId" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes 
    await order.save();
    await sendDeliveryOtpMail(order, otp);

    res.status(200).json({ success: true, message: `Delivery OTP sent successfully to ${order?.user?.name}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: "send Delivery Otp error" });
  }
}

const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;

    const order = await Order.findById(orderId);
    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!order || !shopOrder) {
      return res.status(400).json({ message: "Enter valid orderId or shopOrderId" });
    }
    if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }
    order.payment = true; // Mark payment as successful if not already
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    shopOrder.deliveryOtp = null;
    shopOrder.otpExpires = null;
    await order.save();

    const assignment = await DeliveryAssignment.findOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      // assignedTo: shopOrder.assignedDeliveryBoy
    });
    if (!assignment) {
      console.log("❌ Assignment not found for shopOrder", shopOrder._id);
    } else {
      assignment.status = "completed";
      assignment.completedAt = new Date();
      await assignment.save();
    }
    console.log("✅ Assignment marked completed:", assignment._id);

    await order.save();

    const io = req.app.get("io");
    if (io) {
      io.to(String(order.user.socketId)).emit("orderStatusUpdated", {
        orderId: order._id,
        status: "completed"
      });

      // notify delivery boy
      io.to(String(shopOrder.assignedDeliveryBoy)).emit("orderCompleted", {
        orderId: order._id,
        shopOrderId: shopOrder._id,
      });
      // notify owner also
      const shopOwnerId = shopOrder.owner;

      if (shopOwnerId) {
        io.to(String(shopOwnerId)).emit("orderStatusUpdated", {
          orderId: order._id,
          shopOrderId: shopOrder._id,
          status: "delivered",
        });

        io.to(String(shopOwnerId)).emit("dashboardUpdate");
      }
    }

    return res.status(200).json({ success: true, message: "OTP verified, order marked as delivered" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "verify Delivery Otp error" });
  }
}

const getDeliveryStats = async (req, res) => {
  const deliveryBoyId = req.userId;

  const totalDeliveries = await DeliveryAssignment.countDocuments({
    assignedTo: deliveryBoyId,
    status: "completed",
  });

  const todayDeliveries = await DeliveryAssignment.countDocuments({
    deliveryBoy: deliveryBoyId,
    status: "completed",
    createdAt: {
      $gte: new Date().setHours(0, 0, 0, 0),
    },
  });

  const earnings = totalDeliveries * 40; // example

  res.json({
    totalDeliveries,
    todayDeliveries,
    earnings,
  });
};

module.exports = {
  placeOrder,
  verifyPayment,
  getMyOrders,
  updateOrderStatus,
  getDeliveryBoyAssignment,
  acceptAssignment,
  getCutterntOrder,
  getOrderById,
  sendDeliveryOtp,
  verifyDeliveryOtp,
  getDeliveryStats
};
