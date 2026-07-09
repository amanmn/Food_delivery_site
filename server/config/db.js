const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected");
  } catch (error) {
    // console.error("MongoDB connection error:", error);
    // process.exit(1);
    console.error("MongoDB connection error:", error.message);
    console.log("⚠️ Starting server without MongoDB (Docker learning mode)");
  }
};

module.exports = connectDB;
