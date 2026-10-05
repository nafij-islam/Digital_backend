import { Router } from "express";
import { getProducts, getProductBySlug } from "../controllers/product.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { productQuerySchema } from "../validators/product.validator.js";

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Fetch active products for storefront (supports search, sort, pagination)
 */
router.get("/", validate(productQuerySchema, "query"), getProducts);

/**
 * @route   GET /api/products/:slug
 * @desc    Fetch single active product by slug
 */
router.get("/:slug", getProductBySlug);

export default router;
