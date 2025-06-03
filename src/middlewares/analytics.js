const analyticsService = require('../services/analyticsService');

const trackAnalytics = (req, res, next) => {
  if (req.apiKey) {
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    analyticsService.trackRequest(req.apiKey, endpoint);
  }
  next();
};

module.exports = trackAnalytics;
