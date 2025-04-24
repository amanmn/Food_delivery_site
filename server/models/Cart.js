const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1 // Ensure the quantity is at least 1
        }
      }
    ],
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
