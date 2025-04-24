const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true }, // E.g., Pizza, Burger, Drinks
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the restaurant owner
        images: [{ type: String }], // Array of image URLs
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
