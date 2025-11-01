const uploadOnCloudinary = require("../config/cloudinary");
const Item = require("../models/itemmodel");
const Shop = require("../models/shopmodel");

const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body;

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        // console.log(req.userId);

        const shop = await Shop.findOne({ owner: req.userId });
        // console.log(shop);

        if (!shop) return res.status(400).json({ message: "shop not found" })
        const item = await Item.create({
            name, category, foodType, price, image, shop: shop._id
        });

        await shop.items.push(item._id);
        await shop.save();
        const populatedShop = await Shop.findById(shop._id).populate("owner");
        await populatedShop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })



        return res.status(201).json(populatedShop);
    } catch (error) {
        return res.status(500).json({ message: `add item error ${error}` })
    }
}

const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        const item = await Item.findById(itemId);
        if (!item) return res.status(400).json({ message: "item not found" });
        return res.status(200).json(item);

    } catch (error) {
        return res.status(500).json({ message: `get item error ${error}` })
    }
}

const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        const { name, category, foodType, price } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        const item = await Item.findByIdAndUpdate(
            itemId,
            {
                name, category, foodType, price, ...(image && { image })
            },
            { new: true }
        );

        if (!item) return res.status(400).json({ message: "item not found" });

        const shop = await Shop.findOne({ owner: req.userId })
        .populate({
            path: "items",
            options: { sort: { updatedAt: -1 }}
        }).populate("owner");
        return res.status(200).json(shop);

    } catch (error) {
        return res.status(500).json({ message: `edit item error ${error}` })
    }
}

const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findByIdAndDelete(itemId);

        if (!item) return res.status(400).json({ message: "item not found" })
        const shop = await Shop.findOne({ owner: req.userId });
        shop.items = shop.items.filter(i => i !== item._id);
        await shop.save();
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        });
        return res.status(200).json(shop);

    } catch (error) {
        return res.status(500).json({ message: `delete item error ${error}` })
    }
}

module.exports = {
    addItem,
    getItemById,
    editItem,
    deleteItem
}