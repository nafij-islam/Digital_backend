import { Router } from "express";
import {
  getAllProductsAdmin,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} from "../controllers/adminProduct.controller.js";
import { uploadSingleImage } from "../middlewares/multer.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../validators/product.validator.js";

const router = Router();

/**
 * @route   GET /api/admin/products
 * @desc    Fetch all products with administration metadata
 */
router.get("/", validate(productQuerySchema, "query"), getAllProductsAdmin);

/**
 * @route   GET /api/admin/products/:id
 * @desc    Fetch single product by MongoDB ID for admin editing
 */
router.get("/:id", getProductByIdAdmin);

/**
 * @route   POST /api/admin/products
 * @desc    Create product (supports multipart image file or manual imageUrl)
 */
router.post(
  "/",
  uploadSingleImage("image"),
  validate(createProductSchema, "body"),
  createProduct
);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product details and replace image if uploaded
 */
router.put(
  "/:id",
  uploadSingleImage("image"),
  validate(updateProductSchema, "body"),
  updateProduct
);

/**
 * @route   PATCH /api/admin/products/:id/status
 * @desc    Toggle product in-stock / active status
 */
router.patch("/:id/status", toggleProductStatus);

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete product from MongoDB and destroy Cloudinary asset
 */
router.delete("/:id", deleteProduct);

export default router;
