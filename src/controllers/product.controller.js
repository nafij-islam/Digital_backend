import Product from "../models/Product.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * @desc    Get all active products for the public storefront
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    sort = "newest",
    page = 1,
    limit = 20,
  } = req.query;

  // Base filter: only public active products
  const filter = { isActive: true };

  // Search filter across product name and description
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { badge: { $regex: searchRegex } },
    ];
  }

  // Sorting options
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
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Execute query and count in parallel for high performance
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true }),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;
  const hasMore = pageNum < totalPages;

  // Standard response with data array and pagination metadata
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Products fetched successfully",
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasMore,
    },
  });
});

/**
 * @desc    Get single product by unique slug
 * @route   GET /api/products/:slug
 * @access  Public
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    throw ApiError.badRequest("Product slug parameter is required");
  }

  // Find product by slug
  const product = await Product.findOne({
    slug: slug.toLowerCase().trim(),
    isActive: true,
  });

  if (!product) {
    throw ApiError.notFound(`Product with slug '${slug}' not found`);
  }

  return ApiResponse.success(res, "Product fetched successfully", product);
});

export default {
  getProducts,
  getProductBySlug,
};
