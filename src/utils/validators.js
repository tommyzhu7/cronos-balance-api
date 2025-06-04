/**
 * Input Validation Schemas
 * Uses Joi for request parameter validation
 * Ensures all addresses are valid Ethereum addresses
 */

const Joi = require('joi');

/**
 * Ethereum address validation schema
 * Validates that a string is a valid Ethereum address:
 * - Starts with 0x
 * - Followed by exactly 40 hexadecimal characters
 */
const ethereumAddress = Joi.string()
  .pattern(/^0x[a-fA-F0-9]{40}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid Ethereum address format',
    'any.required': 'Address is required',
  });

/**
 * Validation schemas for different endpoints
 */
const schemas = {
  // Schema for native balance endpoint
  address: Joi.object({
    address: ethereumAddress,
  }),
  
  // Schema for token balance endpoint
  tokenBalance: Joi.object({
    address: ethereumAddress,
    tokenAddress: ethereumAddress,
  }),
};

/**
 * Express middleware factory for request validation
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    // Validate request parameters against schema
    const { error } = schema.validate(req.params);
    
    // If validation fails, return 400 error
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
      });
    }
    
    // Validation passed, continue to next middleware
    next();
  };
};

// Export schemas and validation middleware
module.exports = {
  schemas,
  validate,
};
