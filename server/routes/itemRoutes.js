const express = require('express');
const { verifyToken, ownerOnly } = require('../middleware/authmiddleware');
const { addItem, editItem } = require('../controllers/itemController');
const { upload } = require('../middleware/multer');
const router = express.Router();

router.post("/add-item", verifyToken, ownerOnly, upload.single("image"), addItem)
router.post("/edit-item/:itemId", verifyToken, ownerOnly, upload.single("image"), editItem)

module.exports = router;