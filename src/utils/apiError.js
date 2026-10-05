/**
 * Custom ApiError class extending built-in Error.
 * Ensures uniform error format matching the frontend API contract:
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "...",
 *   "errors": []
 * }
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Descriptive error message
   * @param {Array} [errors=[]] - Optional array of granular field/validation errors
   * @param {string} [stack=""] - Optional stack trace override
   */
  constructor(statusCode = 500, message = "Internal Server Error", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.message = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Pre-configured static error constructors
  static badRequest(message = "Bad request", errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized access", errors = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = "Forbidden action", errors = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = "Resource not found", errors = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = "Conflict occurred", errors = []) {
    return new ApiError(409, message, errors);
  }

  static unprocessable(message = "Unprocessable entity", errors = []) {
    return new ApiError(422, message, errors);
  }

  static internal(message = "Internal Server Error", errors = []) {
    return new ApiError(500, message, errors);
  }
}

export default ApiError;
