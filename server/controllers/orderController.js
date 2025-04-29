const Order = require("../models/Order"); // Assuming you have this
const Cart = require("../models/Cart");

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, totalAmount, address } = req.body;

    const newOrder = new Order({
      user: userId,
      items,
      totalAmount,
      deliveryAddress:address,
      status: "Pending",
    });

    console.log(newOrder,"myOOOOOOOOOOOrder");
    

    await newOrder.save();

    // Clear the cart (optional)
    await Cart.findOneAndDelete({ user: userId });

    res.status(200).json({ success: true, message: "Order placed", order: newOrder });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { placeOrder };
