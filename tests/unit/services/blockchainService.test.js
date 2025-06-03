const blockchainService = require('../../../src/services/blockchainService');
const cache = require('../../../src/config/cache');
const { provider } = require('../../../src/utils/blockchain');

jest.mock('../../../src/config/cache');
jest.mock('../../../src/utils/blockchain');

describe('BlockchainService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNativeBalance', () => {
    const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f89026';

    it('should return cached balance if available', async () => {
      const cachedBalance = '100.5';
      cache.get.mockResolvedValue(cachedBalance);

      const result = await blockchainService.getNativeBalance(testAddress);

      expect(result).toBe(cachedBalance);
      expect(cache.get).toHaveBeenCalledWith(`balance:${testAddress}`);
      expect(provider.getBalance).not.toHaveBeenCalled();
    });

    it('should fetch balance from blockchain if not cached', async () => {
      cache.get.mockResolvedValue(null);
      provider.getBalance = jest.fn().mockResolvedValue(BigInt('1000000000000000000'));
      cache.set.mockResolvedValue(true);

      const result = await blockchainService.getNativeBalance(testAddress);

      expect(result).toBe('1.0');
      expect(provider.getBalance).toHaveBeenCalledWith(testAddress);
      expect(cache.set).toHaveBeenCalledWith(`balance:${testAddress}`, '1.0');
    });

    it('should throw error if blockchain call fails', async () => {
      cache.get.mockResolvedValue(null);
      provider.getBalance = jest.fn().mockRejectedValue(new Error('RPC Error'));

      await expect(blockchainService.getNativeBalance(testAddress))
        .rejects.toThrow('RPC Error');
    });
  });
});
