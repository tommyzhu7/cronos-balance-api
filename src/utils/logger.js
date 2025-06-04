/**
 * Winston Logger Configuration
 * Provides structured logging with different log levels
 * Formats: JSON for production, colorized simple for development
 */

const winston = require('winston');

/**
 * Create and configure Winston logger instance
 */
const logger = winston.createLogger({
  // Set log level from environment or default to 'info'
  level: process.env.LOG_LEVEL || 'info',
  
  // Default format for all transports
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }), // Include stack traces
    winston.format.json() // JSON format for easy parsing
  ),
  
  // Configure log outputs
  transports: [
    // Console transport with colorized output for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Add colors to log levels
        winston.format.simple() // Simple format for readability
      ),
    }),
    
    // File transport can be added here for production
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' })
  ],
  
  // Don't exit on handled exceptions
  exitOnError: false
});

/**
 * Log unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export the logger instance
module.exports = logger;
