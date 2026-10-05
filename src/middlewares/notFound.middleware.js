import ApiError from "../utils/apiError.js";

/**
 * 404 Not Found Middleware
 * Intercepts unhandled routes and returns standard 404 ApiError.
 */
export const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(
    `API endpoint '${req.method} ${req.originalUrl}' does not exist.`
  );
  next(error);
};

export default notFoundHandler;
