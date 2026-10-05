import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";

const PORT = parseInt(process.env.PORT, 10) || 5000;
let server;

/**
 * Bootstrap the server
 */
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    console.log("[Server] Connecting to MongoDB...");
    await connectDB();

    // 2. Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 shop.nafij backend running in ${process.env.NODE_ENV || "development"} mode`);
      console.log(`📡 Server listening on: http://localhost:${PORT}`);
      console.log(`📦 Public API: http://localhost:${PORT}/api/products`);
      console.log(`🔐 Admin API:  http://localhost:${PORT}/api/admin/products`);
      console.log(`❤️ Health:     http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error("[Fatal Error] Server failed to start:", error.message);
    process.exit(1);
  }
};

/**
 * Graceful termination handler
 * @param {string} signal
 */
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Process] Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log("[Server] HTTP server closed.");
      await disconnectDB();
      console.log("[Process] Graceful shutdown complete. Exiting.");
      process.exit(0);
    });

    // Force shutdown after 10 seconds if lingering connections exist
    setTimeout(() => {
      console.error("[Process] Forced shutdown after timeout.");
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

// Listen for termination signals
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));

// Global unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("[Unhandled Rejection] at:", promise, "reason:", reason);
});

// Global uncaught exception handler
process.on("uncaughtException", (error) => {
  console.error("[Uncaught Exception]:", error);
  process.exit(1);
});

startServer();
