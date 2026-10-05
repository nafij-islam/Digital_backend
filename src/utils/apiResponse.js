/**
 * Standardized API Response Helper Class
 * Provides consistent response payload structure across all endpoints.
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable success message
   * @param {*} [data=null] - Payload to return to client
   */
  constructor(statusCode = 200, message = "Success", data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /**
   * Directly sends the response using Express response object
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    });
  }

  /**
   * Static factory helper for 200 OK
   */
  static success(res, message = "Operation successful", data = null) {
    return new ApiResponse(200, message, data).send(res);
  }

  /**
   * Static factory helper for 201 Created
   */
  static created(res, message = "Resource created successfully", data = null) {
    return new ApiResponse(201, message, data).send(res);
  }
}

export default ApiResponse;
