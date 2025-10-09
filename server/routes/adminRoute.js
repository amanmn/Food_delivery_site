const express = require('express');
const router = express.Router();
const { verifyToken, adminOnly } = require("../middleware/authmiddleware");
const { getDashboard } = require("../controllers/adminController");

router.get('/dashboard', verifyToken, adminOnly, getDashboard);

module.exports = router;