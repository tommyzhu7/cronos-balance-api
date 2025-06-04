/**
 * Main Router
 * Combines all route modules and applies global middleware
 * All routes defined here will be prefixed with /api/v1
 */

const express = require('express');
const balanceRoutes = require('./balanceRoutes');
const authenticate = require('../middlewares/auth');
const createRateLimiter = require('../middlewares/rateLimiter');

// Create new router instance
const router = express.Router();

/**
 * Apply global middleware to all routes
 * Order matters: authentication should come before rate limiting
 */

// 1. Authentication - validate API key
router.use(authenticate);

// 2. Rate limiting - limit requests per API key
router.use(createRateLimiter());

/**
 * Mount route modules
 * Add new route modules here as the API grows
 */
router.use('/', balanceRoutes);

// Future routes can be added here:
// router.use('/transactions', transactionRoutes);
// router.use('/analytics', analyticsRoutes);

// Export the configured router
module.exports = router;
