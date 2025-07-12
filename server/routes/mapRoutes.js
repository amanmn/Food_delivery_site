const express = require("express");
const axios = require("axios");

const router = express.Router();

// For address suggestions
router.get("/search", async (req, res) => {
  const { q } = req.query;
  try {
    const result = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        format: "json",
        q,
        countrycodes: "in",
        addressdetails: 1,
        dedupe: 1,
        limit: 10,
      },
      headers: {
        "User-Agent": "Food_Delivery_App/1.0 (amanporwal@gmail.com)"
      }
    });
    res.json(result.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});


// For reverse geolocation
router.get("/reverse", async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const result = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon,
        format: "json",
      },
      headers: {
        "User-Agent": "Food_Delivery_App/1.0 (amanporwal@gmail.com)"
      }
    });
    res.json(result.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to reverse geocode" });
  }
});

module.exports = router;
