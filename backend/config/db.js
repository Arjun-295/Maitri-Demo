import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI is not defined in environment variables. Falling back to local memory or skipping DB connection.");
      // For development, we can connect to a local MongoDB instance if MONGO_URI is missing,
      // but the user should ideally provide one.
      const localUri = "mongodb://127.0.0.1:27017/maitri_db";
      const conn = await mongoose.connect(localUri);
      console.log(`MongoDB Connected (Fallback Local): ${conn.connection.host}`);
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Do not exit process if DB fails in dev, just log it.
  }
};

export default connectDB;
