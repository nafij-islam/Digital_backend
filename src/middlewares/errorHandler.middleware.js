import ApiError from "../utils/apiError.js";

/**
 * Global Centralized Error Handling Middleware
 * Converts any caught error into a standardized API JSON error response:
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "...",
 *   "errors": []
 * }
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not already an ApiError instance, convert standard errors
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";
    let errors = [];

    // Mongoose bad ObjectId / CastError
    if (error.name === "CastError") {
      statusCode = 400;
      message = `Invalid resource ID format: '${error.value}' for field '${error.path}'`;
    }

    // Mongoose Duplicate Key Error (e.g. unique slug collision)
    if (error.code === 11000) {
      statusCode = 409;
      const fields = Object.keys(error.keyValue || {});
      const field = fields[0] || "field";
      const value = error.keyValue ? error.keyValue[field] : "";
      message = `Duplicate value '${value}' entered for unique field '${field}'. Please provide a unique value.`;
    }

    // Mongoose Schema Validation Error
    if (error.name === "ValidationError") {
      statusCode = 400;
      errors = Object.values(error.errors || {}).map((val) => ({
        field: val.path,
        message: val.message,
      }));
      message = errors.length > 0 ? errors[0].message : "Validation failed";
    }

    // Malformed JSON payload
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      statusCode = 400;
      message = "Malformed JSON payload in request body";
    }

    error = new ApiError(statusCode, message, errors, error.stack);
  }

  // Response payload matching strict API contract
  const responsePayload = {
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || "An unexpected error occurred",
    errors: error.errors || [],
  };

  // Include stack trace only in local development environment for debugging
  if (process.env.NODE_ENV === "development") {
    responsePayload.stack = error.stack;
  }

  // Log 500 errors to console for server diagnostics
  if (responsePayload.statusCode >= 500) {
    console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, error);
  }

  return res.status(responsePayload.statusCode).json(responsePayload);
};

export default errorHandler;
