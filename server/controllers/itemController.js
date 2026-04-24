const uploadOnCloudinary = require("../config/cloudinary");
const Item = require("../models/Itemmodel");
const Shop = require("../models/shopmodel");
const redisClient = require("../config/redis");

const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body;

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

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
        const updatedItem = await Item.findByIdAndUpdate(
            itemId,
            {
                name, category, foodType, price, ...(image && { image })
            },
            { new: true }
        );

        if (!updatedItem) return res.status(400).json({ message: "item not found" });

        const shop = await Shop.findOne({ owner: req.userId })
            .populate({
                path: "items",
                options: { sort: { updatedAt: -1 } }
            });
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

        shop.items = shop.items.filter(id => id.toString() !== item._id.toString());
        const existingItemIds = await Item.find({ _id: { $in: shop.items } }).select("_id");
        shop.items = existingItemIds.map(i => i._id);

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

const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params;
        if (!city) return res.status(400).json({ message: "city not found" });
        const shops = await Shop.find({
            city: { $regex: new RegExp(`${city}$`, "i") }
        }).populate("items");
        // console.log(shops);

        if (!shops) return res.status(400).json({ message: "shops not found" });

        const shopIds = shops.map(shop => shop._id)
        const items = await Item.find({ shop: { $in: shopIds } })

        return res.status(200).json(items);

    } catch (error) {
        return res.status(500).json({ message: `getItemByCity item error ${error}` })
    }
}

const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId).populate("items");
        if (!shop) return res.status(400).json({ message: "shop not found" });
        return res.status(200).json({
            shop, items: shop.items
        });
    } catch (error) {
        return res.status(500).json({ message: `getItemsByShop item error ${error}` })
    }
}

const searchItems = async (req, res) => {
    try {
        const { query, city } = req.query;
        if (!query || !city) {
            return res.status(400).json({ message: "query and city required" });
        }

        // Check RedisCache First
        const cacheKey = `search:${city}:${query}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log("Cache hit for key:", cacheKey);
            return res.status(200).json(JSON.parse(cachedData));
        }

        const cleanQuery = query.trim().toLowerCase();

        // Get shops by city
        const shops = await Shop.find({
            city: { $regex: `^${city}$`, $options: "i" }
        })
            .select("_id")
            .lean();

        if (!shops.length) return res.status(400).json({ message: "No shops found" });

        const shopIds = shops.map(s => s._id);

        let items = [];
        // First try text search
        items = await Item.find({
            shop: { $in: shopIds },
            $text: { $search: cleanQuery }
        })
            .limit(10)
            .populate("shop", "name image")
            .lean();

        if (items.length === 0) {

            const escapeRegex = (text) =>
                text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            const safeQuery = escapeRegex(cleanQuery);

            items = await Item.find({
                shop: { $in: shopIds },
                name: { $regex: safeQuery, $options: "i" }
            })
                .limit(10)
                .populate("shop", "name image")
                .lean();
        }

        // Store in Redis Cache for 60 seconds
        await redisClient.setEx(cacheKey, 60, JSON.stringify(items));

        return res.status(200).json(items);

    } catch (error) {
        return res.status(500).json({
            message: `searchItems error ${error.message}`
        })
    }
}

module.exports = {
    addItem,
    getItemById,
    editItem,
    deleteItem,
    getItemByCity,
    getItemsByShop,
    searchItems,
}