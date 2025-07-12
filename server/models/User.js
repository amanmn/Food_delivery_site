const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: { type: String, default: "" },
  profilePicture: { type: String, default: "" },// URL to the profile image
  address: [
    {
      label: { type: String, default: "Home" },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true }
    },
  ],
  // ✅ Add reference to Cart
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },

  // ✅ Add reference to Orders
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
