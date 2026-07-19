const uploadOnCloudinary = require("../config/cloudinary");
const Shop = require("../models/shopmodel");
const Order = require("../models/Order");
const Item = require("../models/Itemmodel")
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

const deleteShop = async (req, res) => {
    try {
        const ownerId = req.userId;
        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        // checking for active orders 
        const activeOrders = await Order.countDocuments({
            "shopOrders.shop": shop._id,
            "shopOrders.status": { $in: ["pending", "accepted", "preparing", "out_for_delivery"] },
        });

        if (activeOrders > 0) {
            return res.status(400).json({
                message: `Cannot delete shop: ${activeOrders} active order(s) still in progress. Complete or cancel them first.`,
            });
        }

        await Item.deleteMany({ shop: shop._id });
        await Shop.findByIdAndDelete(shop._id);

        return res.status(200).json({ message: "Shop deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `delete shop error ${error}` });
    }
};

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

        const runningOrders = await Order.countDocuments({
            "shopOrders.owner": ownerId,
            "shopOrders.status": { $in: ["pending", "preparing"] },
        });

        const outForDeliveryOrders = await Order.countDocuments({
            "shopOrders.owner": ownerId,
            "shopOrders.status": "out_for_delivery",
        });

        const cancelledOrders = await Order.countDocuments({
            "shopOrders.owner": ownerId,
            "shopOrders.status": "canceled",
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

        // Recent Orders
        const recentOrders = await Order.find({
            "shopOrders.owner": ownerId,
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name phone");

        const io = req.app.get("io");
        if (io) {
            io.to(String(ownerId)).emit("dashboardUpdate", {
                totalOrders,
                runningOrders,
                cancelledOrders,
                completedOrders,
                earnings,
                outForDeliveryOrders,
                recentOrders,
            });
        }

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
    deleteShop,
    getShopByCity,
    getDashboardStats,
}