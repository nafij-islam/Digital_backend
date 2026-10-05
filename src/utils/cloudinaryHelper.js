import { Readable } from "stream";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import ApiError from "./apiError.js";

/**
 * Uploads a memory buffer (from Multer) to Cloudinary via upload_stream.
 *
 * @param {Buffer} fileBuffer - The file buffer in memory
 * @param {Object} [options={}] - Custom Cloudinary upload options
 * @param {string} [options.folder='shop.nafij/products'] - Cloudinary target directory
 * @param {string} [options.publicId] - Optional custom public ID
 * @returns {Promise<{ secure_url: string, public_id: string, format: string, bytes: number }>}
 */
export const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(ApiError.badRequest("No image file buffer provided for upload"));
    }

    if (!isCloudinaryConfigured()) {
      return reject(
        ApiError.internal(
          "Cloudinary credentials are missing or invalid in environment variables. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        )
      );
    }

    const uploadOptions = {
      folder: "shop.nafij/products",
      resource_type: "image",
      transformation: [
        { quality: "auto:good", fetch_format: "auto" },
      ],
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(
            new ApiError(500, `Cloudinary upload failed: ${error.message}`, [error])
          );
        }
        if (!result) {
          return reject(new ApiError(500, "Cloudinary upload returned empty response"));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    );

    // Pipe the buffer stream into Cloudinary
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID.
 *
 * @param {string} publicId - The Cloudinary publicId to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    return { result: "not_found", message: "No publicId provided" };
  }

  if (!isCloudinaryConfigured()) {
    console.warn(
      `[Cloudinary] Cannot delete asset "${publicId}" - Cloudinary credentials not configured.`
    );
    return { result: "skipped", message: "Cloudinary not configured" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete asset "${publicId}":`, error.message);
    // Don't crash the request if Cloudinary delete fails, return error info
    return { result: "error", error: error.message };
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
};
