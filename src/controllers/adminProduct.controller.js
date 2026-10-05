import Product from "../models/Product.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryHelper.js";
import { generateUniqueSlug, slugify } from "../utils/slugify.js";

/**
 * @desc    Get all products for admin dashboard (both active & inactive)
 * @route   GET /api/admin/products
 * @access  Admin
 */
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const {
    search,
    sort = "newest",
    page = 1,
    limit = 50,
    isActive,
  } = req.query;

  const filter = {};

  // Filter by active status if specified
  if (isActive !== undefined && isActive !== "") {
    filter.isActive = String(isActive).toLowerCase() === "true";
  }

  // Search filter
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { name: { $regex: searchRegex } },
      { slug: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { badge: { $regex: searchRegex } },
    ];
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") {
    sortOption = { price: 1 };
  } else if (sort === "price_desc") {
    sortOption = { price: -1 };
  } else if (sort === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sort === "newest") {
    sortOption = { createdAt: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [products, total, activeCount, inactiveCount] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true }),
    Product.countDocuments(filter),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: false }),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Admin products fetched successfully",
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasMore: pageNum < totalPages,
    },
    meta: {
      totalProducts: activeCount + inactiveCount,
      activeCount,
      inactiveCount,
    },
  });
});

/**
 * @desc    Get single product by ID for admin editing
 * @route   GET /api/admin/products/:id
 * @access  Admin
 */
export const getProductByIdAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound(`Product with ID '${id}' not found`);
  }

  return ApiResponse.success(res, "Product fetched successfully", product);
});

/**
 * @desc    Create a new product with optional image upload to Cloudinary
 * @route   POST /api/admin/products
 * @access  Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    slug: customSlug,
    badge,
    price,
    originalPrice,
    description,
    isActive,
    imageUrl: manualImageUrl,
  } = req.body;

  let finalImageUrl = manualImageUrl;
  let cloudinaryPublicId = null;

  // Handle image upload from Multer memory storage
  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "shop.nafij/products",
      });
      finalImageUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
    } catch (uploadError) {
      throw ApiError.badRequest(`Image upload failed: ${uploadError.message}`);
    }
  }

  // Ensure image URL is present either via file upload or manual URL
  if (!finalImageUrl) {
    throw ApiError.badRequest(
      "Product image is required. Provide an image file (under 'image' field) or 'imageUrl' in body."
    );
  }

  // Auto-generate unique slug if not provided, or ensure uniqueness if provided
  let finalSlug;
  if (customSlug && customSlug.trim() !== "") {
    finalSlug = slugify(customSlug);
    const existing = await Product.findOne({ slug: finalSlug });
    if (existing) {
      throw ApiError.conflict(`Product with slug '${finalSlug}' already exists`);
    }
  } else {
    finalSlug = await generateUniqueSlug(name, Product);
  }

  // Create product document
  const product = await Product.create({
    name,
    slug: finalSlug,
    badge: badge && badge.trim() !== "" ? badge.trim() : null,
    imageUrl: finalImageUrl,
    cloudinaryPublicId,
    price: Number(price),
    originalPrice: originalPrice !== undefined && originalPrice !== null && originalPrice !== ""
      ? Number(originalPrice)
      : null,
    description,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  return ApiResponse.created(res, "Product created successfully", product);
});

/**
 * @desc    Update product details and optionally replace image on Cloudinary
 * @route   PUT /api/admin/products/:id
 * @access  Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    slug: customSlug,
    badge,
    price,
    originalPrice,
    description,
    isActive,
    imageUrl: manualImageUrl,
  } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound(`Product with ID '${id}' not found`);
  }

  // Handle new image upload
  if (req.file) {
    // 1. Delete old image from Cloudinary if publicId exists
    if (product.cloudinaryPublicId) {
      await deleteFromCloudinary(product.cloudinaryPublicId);
    }

    // 2. Upload new image
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: "shop.nafij/products",
    });
    product.imageUrl = uploadResult.secure_url;
    product.cloudinaryPublicId = uploadResult.public_id;
  } else if (manualImageUrl && manualImageUrl !== product.imageUrl) {
    // If a new manual URL is provided and previous was on Cloudinary, optionally clean up
    if (product.cloudinaryPublicId) {
      await deleteFromCloudinary(product.cloudinaryPublicId);
      product.cloudinaryPublicId = null;
    }
    product.imageUrl = manualImageUrl;
  }

  // Handle slug update if explicitly provided or if name changed without custom slug
  if (customSlug && customSlug.trim() !== "") {
    const formattedSlug = slugify(customSlug);
    const existing = await Product.findOne({ slug: formattedSlug, _id: { $ne: id } });
    if (existing) {
      throw ApiError.conflict(`Product with slug '${formattedSlug}' already exists`);
    }
    product.slug = formattedSlug;
  } else if (name && name !== product.name && !customSlug) {
    product.slug = await generateUniqueSlug(name, Product, id);
  }

  // Update text and numerical fields if provided
  if (name !== undefined) product.name = name;
  if (badge !== undefined) product.badge = badge && badge.trim() !== "" ? badge.trim() : null;
  if (price !== undefined) product.price = Number(price);
  if (originalPrice !== undefined) {
    product.originalPrice = originalPrice !== null && originalPrice !== ""
      ? Number(originalPrice)
      : null;
  }
  if (description !== undefined) product.description = description;
  if (isActive !== undefined) product.isActive = Boolean(isActive);

  await product.save();

  return ApiResponse.success(res, "Product updated successfully", product);
});

/**
 * @desc    Toggle product active status (e.g. In Stock / Out of Stock)
 * @route   PATCH /api/admin/products/:id/status
 * @access  Admin
 */
export const toggleProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound(`Product with ID '${id}' not found`);
  }

  // If specific isActive boolean provided, use it; otherwise toggle current value
  if (typeof isActive === "boolean") {
    product.isActive = isActive;
  } else {
    product.isActive = !product.isActive;
  }

  await product.save();

  return ApiResponse.success(
    res,
    `Product marked as ${product.isActive ? "active" : "inactive"} successfully`,
    product
  );
});

/**
 * @desc    Delete product from MongoDB and delete its image asset from Cloudinary
 * @route   DELETE /api/admin/products/:id
 * @access  Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound(`Product with ID '${id}' not found`);
  }

  // Delete associated image from Cloudinary
  if (product.cloudinaryPublicId) {
    await deleteFromCloudinary(product.cloudinaryPublicId);
  }

  // Remove product from database
  await Product.findByIdAndDelete(id);

  return ApiResponse.success(res, "Product and associated media deleted successfully", {
    id,
    deleted: true,
  });
});

export default {
  getAllProductsAdmin,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};
