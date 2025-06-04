/**
 * Main application entry point
 * This file sets up the Express server with all necessary middleware,
 * routes, and error handling
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const helmet = require('helmet'); // Security middleware
const cors = require('cors'); // Cross-Origin Resource Sharing
const swaggerUi = require('swagger-ui-express'); // API documentation UI
const swaggerSpec = require('./config/swagger'); // Swagger configuration
const logger = require('./utils/logger'); // Winston logger instance
const routes = require('./routes'); // API routes
const errorHandler = require('./middlewares/errorHandler'); // Global error handler

// Create Express application instance
const app = express();

// Get port from environment or use default
const PORT = process.env.PORT || 3000;

/**
 * Security Middleware Configuration
 */
// Add security headers to all responses
app.use(helmet());

// Enable CORS for all origins (configure for production)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

/**
 * API Documentation Route
 * Swagger UI will be available at /api-docs
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * API Routes
 * All API routes are prefixed with /api/v1
 */
app.use('/api/v1', routes);

/**
 * Health Check Endpoint
 * Used for monitoring and load balancer health checks
 * No authentication required
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Global Error Handler
 * Must be registered after all other middleware and routes
 */
app.use(errorHandler);

/**
 * Start the HTTP server
 */
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export app for testing
module.exports = app;
