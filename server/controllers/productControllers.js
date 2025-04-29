const product = require("../models/Product");

const getProducts = async (req, res) => {
    try {
        const allProduct = await product.find();
        // console.log(allProduct, "Hello");
        res.status(200).json(allProduct);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
}
module.exports = {getProducts}


