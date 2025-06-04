/**
 * Analytics Middleware (Bonus Feature)
 * Tracks API usage for each request
 * Must be applied after authentication to have access to API key
 */

const analyticsService = require('../services/analyticsService');

/**
 * Track API usage analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const trackAnalytics = (req, res, next) => {
  // Only track if API key is present (authenticated requests)
  if (req.apiKey) {
    // Build endpoint identifier from method and path
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    
    // Track the request asynchronously (don't block the request)
    analyticsService.trackRequest(req.apiKey, endpoint);
  }
  
  // Continue to next middleware
  next();
};

// Export the analytics middleware
module.exports = trackAnalytics;
