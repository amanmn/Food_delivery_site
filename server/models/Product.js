const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true }, // E.g., Pizza, Burger, Drinks
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the restaurant owner
        image: { type: String, default: "" }, 
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
