/**
 * Async handler utility to wrap route controllers and eliminate repetitive try-catch blocks.
 * Forwards any uncaught promise rejection or error to Express `next()` middleware.
 *
 * @param {Function} requestHandler - The asynchronous Express route handler function
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
