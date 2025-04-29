const express = require("express");
const router = express.Router();
const { getProducts } = require("../../controllers/productControllers");

router.get("/getData", getProducts);

module.exports = router;