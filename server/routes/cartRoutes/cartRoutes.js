const express = require("express");
const router = express.Router();
const { addToCart, getUserCart } = require("../../controllers/cartController");
const authMiddleware = require("../../middleware/authmiddleware"); // Middleware to check if user is logged in

router.get("/get", authMiddleware,getUserCart);
router.post("/add", authMiddleware, addToCart);

module.exports = router;
