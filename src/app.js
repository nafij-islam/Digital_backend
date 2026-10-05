import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import apiRouter from "./routes/index.js";
import notFoundHandler from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import ApiResponse from "./utils/apiResponse.js";
import { connectDB } from "./config/db.js";

const app = express();

// Trust reverse proxy (e.g., Render, Railway, Vercel, Nginx)
app.set("trust proxy", 1);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS Configuration
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000,https://shop.nafij.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or curl/Postman requests without origin
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes("*") ||
      process.env.NODE_ENV === "development"
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin '${origin}' not allowed by CORS policy`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// HTTP Request Logger
const isDev = process.env.NODE_ENV === "development";
app.use(morgan(isDev ? "dev" : "combined"));

// Rate Limiting (200 requests per 15 minutes window)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
    errors: [],
  },
});
app.use("/api", limiter);

// Request body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Serverless DB connection middleware (guarantees DB connection in Vercel serverless environment)
app.use(async (req, res, next) => {
  if (req.path === "/" || req.path === "/api/health") {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Root route welcoming to API
app.get("/", (req, res) => {
  return ApiResponse.success(res, "Welcome to shop.nafij Digital Subscriptions API", {
    service: "shop.nafij backend",
    version: "1.0.0",
    docs: {
      publicProducts: "/api/products",
      adminProducts: "/api/admin/products",
      healthCheck: "/api/health",
    },
  });
});

// Mount Main API Routes
app.use("/api", apiRouter);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
