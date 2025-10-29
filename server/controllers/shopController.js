const uploadOnCloudinary = require("../config/cloudinary");
const { default: Shop } = require("../models/shopmodel");


const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            shop = await Shop.create({
                name, city, state, address, image, owner: req.userId
            })
        } else {
            shop = await Shop.findByIdAndUpdate(shop._id, {
                name, city, state, address, image, owner: req.userId
            }, { new: true })
        }

        await shop.populate("owner");
        return res.status(201).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `create shop error ${error}` })
    }
}

const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner items");
        if (!shop) return null;

        return res.status(200).json(shop);

    } catch (error) {
        return res.status(500).json({ message: `getmyshop  error ${error}` })
    }
}

module.exports = {
    createEditShop,
    getMyShop
}