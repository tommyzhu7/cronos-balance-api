/**
 * Unit Tests for Input Validators
 * Tests the Joi validation schemas for address validation
 */

const { schemas } = require('../../src/utils/validators');

describe('Validators', () => {
  describe('Address validation', () => {
    it('should validate correct Ethereum address', () => {
      // Test with a valid Ethereum address
      const result = schemas.address.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
      });
      
      // Expect no validation errors
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid Ethereum address', () => {
      // Test with an invalid address (missing characters)
      const result = schemas.address.validate({
        address: '0xinvalid',
      });
      
      // Expect validation error with specific message
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Invalid Ethereum address format');
    });

    it('should reject missing address', () => {
      // Test with empty object (missing required field)
      const result = schemas.address.validate({});
      
      // Expect validation error for required field
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Address is required');
    });

    it('should reject address without 0x prefix', () => {
      // Test with address missing 0x prefix
      const result = schemas.address.validate({
        address: '742d35Cc6634C0532925a3b844Bc9e7595f89026',
      });
      
      // Expect validation error
      expect(result.error).toBeDefined();
    });

    it('should reject address with invalid characters', () => {
      // Test with non-hexadecimal characters
      const result = schemas.address.validate({
        address: '0xGGGG35Cc6634C0532925a3b844Bc9e7595f89026',
      });
      
      // Expect validation error
      expect(result.error).toBeDefined();
    });
  });

  describe('Token balance validation', () => {
    it('should validate correct addresses', () => {
      // Test with valid wallet and token addresses
      const result = schemas.tokenBalance.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      });
      
      // Expect no validation errors
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid token address', () => {
      // Test with invalid token address
      const result = schemas.tokenBalance.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
        tokenAddress: 'invalid',
      });
      
      // Expect validation error
      expect(result.error).toBeDefined();
    });

    it('should reject missing token address', () => {
      // Test with missing token address
      const result = schemas.tokenBalance.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
      });
      
      // Expect validation error for required field
      expect(result.error).toBeDefined();
    });
  });
});
