const Order = require("../models/Order");
const Product = require("../models/Product");

const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body; // items should include product ID and quantity
    const userId = req.user.id; // User ID from authMiddleware (the logged-in user)

    // Step 1: Validate the order
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in the cart" });
    }

    // Step 2: Fetch product details and calculate the total amount
    let totalAmount = 0;
    const productIds = items.map(item => item.product);

    // Fetch the products from the database
    const products = await Product.find({ '_id': { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: "Some products not found" });
    }

    // Calculate the total amount
    items.forEach(item => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    });

    // Step 3: Create the order
    const order = new Order({
      user: userId,
      items,
      totalAmount,
      deliveryAddress,
      paymentStatus: "pending", // assuming payment is pending when placing the order
      orderStatus: "pending", // initially the order status is "pending"
    });

    // Step 4: Save the order to the database
    await order.save();

    // Step 5: Respond with the order details
    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  placeOrder,
};
