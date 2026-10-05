import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

/**
 * Connects to MongoDB with reconnection logic and listeners
 */
export const connectDB = async () => {
  if (isConnected) {
    console.log("[MongoDB] Using existing database connection");
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("[MongoDB Error] MONGO_URI environment variable is not defined!");
    throw new Error("MONGO_URI is missing in environment variables");
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== "production", // Build indexes in dev, skip in high-traffic prod
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Connection runtime error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Connection lost. Attempting reconnect...");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("[MongoDB] Reconnected successfully");
      isConnected = true;
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    throw error;
  }
};

/**
 * Gracefully disconnects from MongoDB
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log("[MongoDB] Connection closed gracefully");
  } catch (error) {
    console.error("[MongoDB] Error during disconnection:", error.message);
  }
};

export default connectDB;
