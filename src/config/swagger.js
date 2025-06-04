/**
 * Swagger/OpenAPI Configuration
 * Generates API documentation from JSDoc comments in route files
 */

const swaggerJsdoc = require('swagger-jsdoc');

// Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cronos Blockchain API',
      version: '1.0.0',
      description: 'A secure API for interacting with the Cronos blockchain to fetch CRO and CRC20 token balances',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/v1',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication'
        },
      },
    },
    // Apply API key security to all endpoints by default
    security: [
      {
        apiKey: [],
      },
    ],
  },
  // Path to files containing OpenAPI definitions
  apis: ['./src/routes/*.js'],
};

// Generate and export the swagger specification
module.exports = swaggerJsdoc(options);
