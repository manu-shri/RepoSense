import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log("MONGODB_URI not defined, using in-memory mode");
      return;
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection failed, using in-memory mode:", error.message);
    // Don't exit, continue with in-memory mode
  }
};

export default connectDB;
