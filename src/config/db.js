import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Global cache for serverless environments (e.g. Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB with reconnection logic, pooling, and serverless cache
 */
export const connectDB = async () => {
  // If readyState is 1 (connected), return existing connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("[MongoDB Error] MONGO_URI environment variable is not defined!");
    throw new Error("MONGO_URI is missing in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: process.env.NODE_ENV !== "production",
      })
      .then((m) => {
        console.log(`[MongoDB] Connected successfully to: ${m.connection.host}/${m.connection.name}`);
        return m.connection;
      })
      .catch((err) => {
        cached.promise = null;
        console.error(`[MongoDB] Connection error: ${err.message}`);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

/**
 * Gracefully disconnects from MongoDB
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log("[MongoDB] Connection closed gracefully");
  } catch (error) {
    console.error("[MongoDB] Error during disconnection:", error.message);
  }
};

export default connectDB;
