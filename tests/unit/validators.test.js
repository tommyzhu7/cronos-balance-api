const { schemas } = require('../../src/utils/validators');

describe('Validators', () => {
  describe('Address validation', () => {
    it('should validate correct Ethereum address', () => {
      const result = schemas.address.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
      });
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid Ethereum address', () => {
      const result = schemas.address.validate({
        address: '0xinvalid',
      });
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Invalid Ethereum address format');
    });

    it('should reject missing address', () => {
      const result = schemas.address.validate({});
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Address is required');
    });
  });

  describe('Token balance validation', () => {
    it('should validate correct addresses', () => {
      const result = schemas.tokenBalance.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      });
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid token address', () => {
      const result = schemas.tokenBalance.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
        tokenAddress: 'invalid',
      });
      expect(result.error).toBeDefined();
    });
  });
});
