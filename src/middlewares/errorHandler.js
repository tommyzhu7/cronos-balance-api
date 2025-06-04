/**
 * Global Error Handler Middleware
 * Catches all errors thrown in the application
 * Formats error responses consistently
 */

const logger = require('../utils/logger');

/**
 * Express error handling middleware
 * Must have 4 parameters to be recognized as error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    apiKey: req.apiKey,
  });

  // Handle validation errors (from Joi or custom validation)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }

  // Handle blockchain RPC connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Unable to connect to blockchain RPC',
    });
  }

  // Handle contract call exceptions (invalid contract address)
  if (err.code === 'CALL_EXCEPTION') {
    return res.status(400).json({
      error: 'Contract Error',
      message: 'Invalid contract address or contract call failed',
    });
  }

  // Default error response for unhandled errors
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack }), // Include stack trace in development
  });
};

// Export the error handler middleware
module.exports = errorHandler;
