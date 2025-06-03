const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Store for tracking requests per API key
const rateLimitStore = new Map();

const createRateLimiter = () => {
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000, // 1 hour
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    keyGenerator: (req) => req.apiKey || req.ip,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for API key: ${req.apiKey}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      });
    },
    skip: (req) => !req.apiKey, // Skip if no API key (will be caught by auth)
  });
};

module.exports = createRateLimiter;
