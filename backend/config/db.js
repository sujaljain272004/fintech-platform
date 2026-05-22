const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is missing from backend environment variables.");
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};

module.exports = connectDB;
