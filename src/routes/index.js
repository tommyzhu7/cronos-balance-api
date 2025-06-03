const express = require('express');
const balanceRoutes = require('./balanceRoutes');
const authenticate = require('../middlewares/auth');
const createRateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(authenticate);
router.use(createRateLimiter());

// Mount route modules
router.use('/', balanceRoutes);

module.exports = router;
