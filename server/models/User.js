const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  phone: {
    type: String,
    default: ""
  },
  profilePicture: {
    type: String,
    default: ""  // URL to the profile image
  },
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

  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    }
  ],

  // ✅ Add reference to Orders
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],

  role: {
    type: String,
    enum: ["user", "owner", "deliveryBoy"],
    required: true,
    default: "user",
  },
  resetOtp: { type: String },
  isOtpVerified: {
    type: Boolean,
    default: false,
  },
  otpExpires: { type: Date },
  googleId: {
    type: String,
    index: true,
    unique: true,
    sparse: true
  },
  passwordChangedAt: { type: Date },
  refreshToken: { type: String, select: false },
  createdAt: { type: Date, default: Date.now },

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
