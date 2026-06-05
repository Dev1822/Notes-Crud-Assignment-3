require('dotenv').config();  
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.log("Database connection error", err);
  }
};

module.exports = connectDB;