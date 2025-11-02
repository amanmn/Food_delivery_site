const express = require('express');
const { verifyToken, ownerOnly } = require('../middleware/authmiddleware');
const { addItem, editItem, getItemById, deleteItem, getItemByCity } = require('../controllers/itemController');
const { upload } = require('../middleware/multer');
const router = express.Router();

router.post("/add-item", verifyToken, ownerOnly, upload.single("image"), addItem)
router.get("/get-item/:itemId", verifyToken, ownerOnly, getItemById);
router.put("/edit-item/:itemId", verifyToken, ownerOnly, upload.single("image"), editItem)
router.get("/delete-item/:itemId", verifyToken, ownerOnly, deleteItem);

router.get("/get-item-by-city/:city", getItemByCity);

module.exports = router;