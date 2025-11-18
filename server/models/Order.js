const mongoose = require("mongoose");

const shopOrderItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  name: String,
  price: Number,
  quantity: Number,

}, { timeStamps: true });

const shopOrderSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  subtotal: Number,
  shopOrderItems: [shopOrderItemSchema],
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "preparing",
      "out_for_delivery",
      "delivered",
      "canceled",
    ],
    default: "pending",
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryAssignment",
    default: null
  },
  assignedDeliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  availableBoys: [
    {
      type: mongoose.Schema.Types.Mixed,
    }
  ]
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "online"],
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  shopOrders: [shopOrderSchema],
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  deliveryAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    text: String,
    latitude: Number,
    longitude: Number
  },
  // assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // Admin handling the order
  createdAt: { type: Date, default: Date.now },
},
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
