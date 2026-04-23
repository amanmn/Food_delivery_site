const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        index: true,
    },
    category: {
        type: String,
        enum: [
            "Snacks",
            "Main Course",
            "Desserts",
            "Pizza",
            "Burgers",
            "Sandwiches",
            "South Indian",
            "North Indian",
            "Chinese",
            "Fast Food",
            "Others",
        ],
        required: true,
        index: true,
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    foodType: {
        type: String,
        enum: ["veg", "non veg"],
        required: true,
        index: true
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    }
}, { timestamps: true })

itemSchema.index({
    name: "text",
    category: "text"
});

itemSchema.index({ name: 1 }); //for prefix search

module.exports = mongoose.model("Item", itemSchema);