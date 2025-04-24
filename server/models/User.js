const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: { type: String, default: "" }, 
  profilePicture: { type: String, default: "" },// URL to the profile image
  address: [
    {
      label: { type: String, default: "Home" }, // Home, Work, etc.
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true }
    },
  ],
  cartProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart'
    }
  ],
  orders: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      status: {
        type: String,
        enum: ["pending", "preparing", "out_for_delivery", "delivered"],
        default: "pending",
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
