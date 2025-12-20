const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const populateUser = require("../utils/populateUser");
const Shop = require("../models/shopmodel");
const DeliveryAssignment = require("../models/deliveryAssignment");
const { model } = require("mongoose");
const { sendDeliveryOtpMail } = require("../utils/nodemailer");

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
        if (!shop) return res.status(400).json({ success: false, message: "shop not found" });
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
    // Remove user's Cart now that the order was placed
    try {
      await Cart.findOneAndDelete({ user: userId });
      await User.findByIdAndUpdate(userId, { $unset: { cart: "" } });
    } catch (err) {
      console.error("Error clearing cart after order:", err);
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


const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    // console.log(user);

    if (user.role === "user") {
      // console.log("user");

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
        .populate("user")

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
        .populate("user")

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

    const order = await Order.findOne({ _id: orderId, "shopOrders.owner": ownerId });

    if (!order) return res.status(404).json({ success: false, message: "Order not found or unauthorized" });

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
            status: { $nin: ["broadcasted", "completed"] }
          }).distinct("assignedTo");

          const busyIdSet = new Set(busyIds.map(id => String(id)));
          const availableDeliveryBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));

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

            // Assign the assignment id to the shopOrder (store ObjectId instead of full doc)
            shopOrder.assignment = deliveryAssignment._id;

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
    console.log("Updated Shop Order:", updatedShopOrder);

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
    })
      .populate("order")
      .populate("shop");

    const formated = assignments.map(a => {
      const shopOrder = a.order?.shopOrders?.find(
        (shopOrder) => String(shopOrder._id) === String(a.shopOrderId)
      );

      return {
        assignmentId: a._id, 
        orderId: a.order._id,
        shopOrderId: a.shopOrderId,
        shopName: a.shop.name,
        deliveryAddress: a.order.deliveryAddress,
        items: shopOrder?.shopOrderItems || [],
        subtotal: shopOrder?.subtotal || 0,
        status: a.status,
      };
    });

    return res.status(200).json(formated);
  } catch (error) {
    return res.status(500).json({ success: false, message: "get Assignment error" });
  }
}

const acceptAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId)
    // console.log(assignment, "DeliveryAssignment");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    if (assignment.status !== "broadcasted") {
      return res.status(400).json({ message: "Assignment is expired" })
    }

    const alreadyAssignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    })

    if (alreadyAssignment) {
      return res.status(400).json({ message: "You already have assigned to another order" })
    }

    assignment.assignedTo = req.userId;
    assignment.status = 'assigned';
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order)
    if (!order) return res.status(400).json({ message: "order not found" })

    const shopOrder = order.shopOrders.find(so => String(so._id) === String(assignment.shopOrderId))

    shopOrder.assignedDeliveryBoy = req.userId
    console.log(shopOrder.assignedDeliveryBoy, "assignedDeliveryBoy");

    await order.save()
    await order.populate('shopOrders.assignedDeliveryBoy')

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
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    shopOrder.deliveryOtp = null;
    shopOrder.otpExpires = null;
    await order.save();

    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy
    })

    

    return res.status(200).json({ success: true, message: "OTP verified, order marked as delivered" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "verify Delivery Otp error" });
  }
}

module.exports = {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  getDeliveryBoyAssignment,
  acceptAssignment,
  getCutterntOrder,
  getOrderById,
  sendDeliveryOtp,
  verifyDeliveryOtp
};
