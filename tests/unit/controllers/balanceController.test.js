const balanceController = require('../../../src/controllers/balanceController');
const blockchainService = require('../../../src/services/blockchainService');

jest.mock('../../../src/services/blockchainService');

describe('BalanceController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getNativeBalance', () => {
    it('should return native balance successfully', async () => {
      req.params.address = '0x742d35Cc6634C0532925a3b844Bc9e7595f89026';
      blockchainService.getNativeBalance.mockResolvedValue('100.5');

      await balanceController.getNativeBalance(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        address: req.params.address,
        balance: '100.5',
        symbol: 'CRO',
        timestamp: expect.any(String),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      req.params.address = '0x742d35Cc6634C0532925a3b844Bc9e7595f89026';
      const error = new Error('RPC Error');
      blockchainService.getNativeBalance.mockRejectedValue(error);

      await balanceController.getNativeBalance(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getTokenBalance', () => {
    it('should return token balance successfully', async () => {
      req.params.address = '0x742d35Cc6634C0532925a3b844Bc9e7595f89026';
      req.params.tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      
      const mockTokenData = {
        balance: '1000.0',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
        rawBalance: '1000000000',
      };
      
      blockchainService.getTokenBalance.mockResolvedValue(mockTokenData);

      await balanceController.getTokenBalance(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        address: req.params.address,
        tokenAddress: req.params.tokenAddress,
        ...mockTokenData,
        timestamp: expect.any(String),
      });
    });
  });
});
