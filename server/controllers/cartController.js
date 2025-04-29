const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");


const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity) {
      return res.status(400).json({ success: false, message: "Product ID and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    // If the cart doesn't exist, create a new cart
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }]
      });
      await cart.save();
    } else {

      const existingItem = cart.items.find(item => item.product.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;  // Increase quantity if product is already in the cart
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    }
    

    // Optional: You can add a reference of this cart to the user's cartProducts field (if needed)
    const user = await User.findById(userId);
    console.log(user.cartProducts,"");
    if (!user.cartProducts.includes(cart._id)) {
      user.cartProducts.push(cart._id);
      await user.save();
    }

    const populatedUser = await User.findById(userId).populate({
      path: 'cartProducts',
      populate: {
        path: 'items.product',
        model: 'Product',
      },
    });

    console.log("User with populated cart:", populatedUser);


    res.status(200).json({ success: true, message: "Item added to cart", cart });
  } catch (err) {
    console.error("Error adding item to cart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserCart = async (req, res) => {
  
  try {
    
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    console.log(cart,": Cartttttttttt");
    
    if (!cart) {
      return res.status(404).json({item:[], message: "Cart not found" });
    }
    await cart.save();
    res.status(200).json(cart); // 🧠 this will now return full product details
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ success: true, message: "Cart item updated", cart });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addToCart, getUserCart, updateCartItem };
