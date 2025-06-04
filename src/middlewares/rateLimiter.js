/**
 * Rate Limiting Middleware
 * Limits the number of requests per API key within a time window
 * Prevents abuse and ensures fair usage of the API
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Create and configure rate limiter instance
 * @returns {Function} Express rate limit middleware
 */
const createRateLimiter = () => {
  return rateLimit({
    // Time window in milliseconds (default: 1 hour)
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000,
    
    // Maximum number of requests per window (default: 100)
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    
    // Generate unique key for each API key or IP address
    keyGenerator: (req) => req.apiKey || req.ip,
    
    // Handler for when rate limit is exceeded
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for API key: ${req.apiKey}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: req.rateLimit.resetTime, // When the limit resets
      });
    },
    
    // Skip rate limiting if no API key (will be caught by auth)
    skip: (req) => !req.apiKey,
    
    // Include rate limit info in response headers
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
  });
};

// Export the rate limiter factory function
module.exports = createRateLimiter;
