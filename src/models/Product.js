import mongoose from "mongoose";

/**
 * Product Mongoose Schema
 * Strictly designed to match the shop.nafij frontend specifications
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    badge: {
      type: String, // e.g. "Best Seller", "Most Popular", "2TB Included", "Next-Gen AI"
      default: null,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Product image URL is required"],
    },
    cloudinaryPublicId: {
      type: String, // To delete/replace the image on Cloudinary when product is updated or deleted
      default: null,
    },
    price: {
      type: Number,
      required: [true, "Current selling price is required"],
      min: [0, "Price must be non-negative"],
    },
    originalPrice: {
      type: Number,
      default: null,
      min: [0, "Original price must be non-negative"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: calculate discount percentage when originalPrice is higher than price
productSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual: check if item has an active sale discount
productSchema.virtual("isOnSale").get(function () {
  return Boolean(this.originalPrice && this.originalPrice > this.price);
});

// Search text index on name and description
productSchema.index({ name: "text", description: "text" });

// Compound index for active products sorted by creation
productSchema.index({ isActive: 1, createdAt: -1 });

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
