import { Router } from "express";
import productRoutes from "./product.routes.js";
import adminRoutes from "./admin.routes.js";
import ApiResponse from "../utils/apiResponse.js";

const apiRouter = Router();

// API Health Check
apiRouter.get("/health", (req, res) => {
  return ApiResponse.success(res, "shop.nafij API is operating smoothly", {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Storefront product routes
apiRouter.use("/products", productRoutes);

// Admin product management routes
apiRouter.use("/admin/products", adminRoutes);

export default apiRouter;
