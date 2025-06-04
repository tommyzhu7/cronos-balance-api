/**
 * Authentication Middleware
 * Validates API keys from request headers
 * API keys are stored in environment variables
 */

const logger = require('../utils/logger');

/**
 * Authentication middleware function
 * Checks for valid API key in x-api-key header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = (req, res, next) => {
  // Extract API key from request headers
  const apiKey = req.headers['x-api-key'];

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required',
    });
  }

  // Get valid API keys from environment variables
  // API_KEYS should be comma-separated list: "key1,key2,key3"
  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  // Validate the provided API key
  if (!validApiKeys.includes(apiKey)) {
    // Log invalid authentication attempts for security monitoring
    logger.warn(`Invalid API key attempt: ${apiKey}`);
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
  }

  // Store API key in request object for use in other middleware
  // (e.g., rate limiting, analytics)
  req.apiKey = apiKey;
  
  // Authentication successful, proceed to next middleware
  next();
};

// Export the authentication middleware
module.exports = authenticate;
