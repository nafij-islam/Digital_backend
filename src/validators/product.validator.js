import { z } from "zod";

/**
 * Helper to coerce string booleans ("true", "false", true, false)
 */
const booleanCoerce = z.preprocess((val) => {
  if (typeof val === "string") {
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
  }
  return val;
}, z.boolean());

/**
 * Helper to coerce numbers or nullable numbers
 */
const numberCoerce = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const parsed = Number(val);
  return isNaN(parsed) ? val : parsed;
}, z.number().min(0, "Price must be non-negative"));

const nullableNumberCoerce = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return null;
  const parsed = Number(val);
  return isNaN(parsed) ? val : parsed;
}, z.number().min(0, "Original price must be non-negative").nullable());

/**
 * Validation schema for creating a product
 */
export const createProductSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(150, "Product name cannot exceed 150 characters"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .optional(),
  badge: z
    .string()
    .trim()
    .nullable()
    .optional(),
  imageUrl: z
    .string()
    .url("Product image URL must be a valid URL")
    .optional(),
  price: numberCoerce,
  originalPrice: nullableNumberCoerce.optional(),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(5, "Description must be at least 5 characters"),
  isActive: booleanCoerce.optional().default(true),
});

/**
 * Validation schema for updating a product (all fields optional)
 */
export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(150, "Product name cannot exceed 150 characters")
    .optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .optional(),
  badge: z
    .string()
    .trim()
    .nullable()
    .optional(),
  imageUrl: z
    .string()
    .url("Product image URL must be a valid URL")
    .optional(),
  price: numberCoerce.optional(),
  originalPrice: nullableNumberCoerce.optional(),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .optional(),
  isActive: booleanCoerce.optional(),
});

/**
 * Validation schema for query parameters (filters, pagination, sorting)
 */
export const productQuerySchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().min(1)).optional().default(1),
  limit: z.preprocess((val) => (val ? Number(val) : 20), z.number().int().min(1).max(100)).optional().default(20),
  search: z.string().trim().optional(),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).optional().default("newest"),
  isActive: booleanCoerce.optional(),
});
