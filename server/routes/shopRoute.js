const express = require('express');
const { createEditShop, getMyShop, getShopByCity, getDashboardStats } = require('../controllers/shopController');
const { verifyToken, ownerOnly } = require('../middleware/authmiddleware');
const { upload } = require('../middleware/multer');
const router = express.Router();

router.post("/create-edit", verifyToken, ownerOnly, upload.single("image"), createEditShop)
router.get("/get-myshop", verifyToken, ownerOnly, getMyShop);

router.get("/get-shop-by-city/:city", getShopByCity);
router.get("/dashboard", verifyToken, ownerOnly, getDashboardStats);
module.exports = router;