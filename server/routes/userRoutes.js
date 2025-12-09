const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authmiddleware");

const {
  cloudinaryImg,
  profile,
  updateUser,
  upload,
  updateUserLocation,
} = require("../controllers/userController");

// getDeliveryBoys is exported separately from controller file
const { getDeliveryBoys } = require("../controllers/userController");

router.get("/profile", verifyToken, profile);
router.put("/update", verifyToken, updateUser);
router.post("/upload", verifyToken, upload.single("profileImage"), cloudinaryImg);

router.post('/update-location', verifyToken, updateUserLocation)

// List delivery boys
router.get('/delivery-boys', verifyToken, getDeliveryBoys);

module.exports = router;
