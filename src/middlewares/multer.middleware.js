import multer from "multer";
import ApiError from "../utils/apiError.js";

// Use in-memory buffer storage so files are streamed straight to Cloudinary
const storage = multer.memoryStorage();

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WEBP, AVIF, and GIF images are allowed.`
      ),
      false
    );
  }
};

// Base multer instance configured with 5MB file limit
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes limit
    files: 1, // Single image per product
  },
});

/**
 * Middleware wrapper to handle single file upload with Multer error handling
 * @param {string} fieldName - Form field name (default: "image")
 */
export const uploadSingleImage = (fieldName = "image") => {
  const multerUpload = upload.single(fieldName);

  return (req, res, next) => {
    multerUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(ApiError.badRequest("Image file size exceeds the 5MB limit"));
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            ApiError.badRequest(
              `Unexpected field "${err.field}". Image must be uploaded under "${fieldName}"`
            )
          );
        }
        return next(ApiError.badRequest(`File upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

export default upload;
