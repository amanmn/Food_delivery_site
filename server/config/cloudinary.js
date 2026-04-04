const cloudinary = require('cloudinary').v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;

    const result = await cloudinary.uploader.upload(file, {
      folder: "profile-pictures",
    });
    fs.unlinkSync(file); // delete local file
    return result.secure_url;
  } catch (error) {
    if (file) fs.unlinkSync(file); // delete local file on error
    console.log("Cloudinary Error:", error);
    return null;
  }
};

module.exports = uploadOnCloudinary;
