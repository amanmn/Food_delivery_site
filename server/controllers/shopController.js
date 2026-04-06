const uploadOnCloudinary = require("../config/cloudinary");
const Shop = require("../models/shopmodel");
const Order = require("../models/Order");
const { default: mongoose } = require("mongoose");

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

        shop = await Shop.findById(shop._id).populate("owner"); // ✅ correct populate
        // console.log(shop);

        return res.status(201).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `create shop error ${error}` })
    }
}

const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId })
            .populate("owner")
            .populate({
                path: "items",
                options: { sort: { updatedAt: -1 } }
            });

        if (!shop) {
            return res.status(200).json(null); // ✅ return null, not 404 or empty response
        }

        return res.status(200).json(shop);

    } catch (error) {
        return res.status(500).json({ message: `getmyshop  error ${error}` })
    }
}

const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params;
        // console.log(city);

        const shops = await Shop.find({
            city: { $regex: new RegExp(`${city}$`, "i") }
        }).populate("items");
        // console.log(shops,"shops");

        if (!shops) return res.status(400).json({ message: "shops not found" });

        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({ message: `getmyshopbycity  error ${error}` })
    }
}

const getDashboardStats = async (req, res) => {
    try {
        const ownerId = req.userId;

        const totalOrders = await Order.countDocuments({
            "shopOrders.owner": ownerId,
        });
        console.log(totalOrders, "total orders");
        const runningOrders = await Order.countDocuments({
            "shopOrders.owner": ownerId,
            "shopOrders.status": { $in: ["pending", "preparing"] },
        });
        console.log(runningOrders, "running orders");

        const outForDeliveryOrders = await Order.countDocuments({
            "shopOrders.owner": ownerId,
            "shopOrders.status": "out_for_delivery",
        });
        console.log(outForDeliveryOrders, "out for delivery orders");

        const cancelledOrders = await Order.countDocuments({
            "shopOrders.owner": ownerId,
            "shopOrders.status": "cancelled",
        });

        const completedOrders = await Order.countDocuments({
            "shopOrders.owner": ownerId,
            "shopOrders.status": "delivered",
        });

        // 💰 Earnings
        const earningsData = await Order.aggregate([
            { $unwind: "$shopOrders" },
            {
                $match: {
                    "shopOrders.owner": new mongoose.Types.ObjectId(ownerId),
                    "shopOrders.status": "delivered",
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$shopOrders.subtotal" },
                },
            },
        ]);

        const earnings = earningsData[0]?.total || 0;

        // 🆕 Recent Orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name phone");

        res.status(200).json({
            success: true,
            totalOrders,
            runningOrders,
            cancelledOrders,
            completedOrders,
            earnings,
            outForDeliveryOrders,
            recentOrders,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Dashboard error"
        });
    }
};

module.exports = {
    createEditShop,
    getMyShop,
    getShopByCity,
    getDashboardStats,
}