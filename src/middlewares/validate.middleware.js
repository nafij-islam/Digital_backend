import ApiError from "../utils/apiError.js";

/**
 * Higher-order middleware function to validate incoming request data using Zod schema.
 *
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {'body'|'query'|'params'} [source='body'] - Request property to validate
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsedData = schema.parse(dataToValidate);
      // Replace with sanitized/coerced data
      req[source] = parsedData;
      next();
    } catch (error) {
      if (error && error.errors) {
        // Format Zod errors
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        const errorMessage = formattedErrors.length > 0
          ? formattedErrors[0].message
          : "Request validation failed";

        return next(new ApiError(400, errorMessage, formattedErrors));
      }

      next(error);
    }
  };
};

export default validate;
