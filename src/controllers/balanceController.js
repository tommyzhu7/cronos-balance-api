const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

class BalanceController {
  async getNativeBalance(req, res, next) {
    try {
      const { address } = req.params;
      
      logger.info(`Fetching native balance for address: ${address}`);
      
      const balance = await blockchainService.getNativeBalance(address);
      
      res.json({
        address,
        balance,
        symbol: 'CRO',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTokenBalance(req, res, next) {
    try {
      const { address, tokenAddress } = req.params;
      
      logger.info(`Fetching token balance for address: ${address}, token: ${tokenAddress}`);
      
      const tokenData = await blockchainService.getTokenBalance(address, tokenAddress);
      
      res.json({
        address,
        tokenAddress,
        ...tokenData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BalanceController();
