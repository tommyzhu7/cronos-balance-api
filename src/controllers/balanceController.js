/**
 * Balance Controller
 * Handles HTTP requests for balance endpoints
 * Delegates business logic to blockchain service
 */

const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

/**
 * Balance Controller Class
 * Contains route handler methods
 */
class BalanceController {
  /**
   * Get native CRO balance
   * Route: GET /balance/:address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getNativeBalance(req, res, next) {
    try {
      // Extract address from URL parameters
      const { address } = req.params;
      
      logger.info(`Fetching native balance for address: ${address}`);
      
      // Call blockchain service to get balance
      const balance = await blockchainService.getNativeBalance(address);
      
      // Send successful response
      res.json({
        address,
        balance,
        symbol: 'CRO',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Pass error to error handler middleware
      next(error);
    }
  }

  /**
   * Get CRC20 token balance
   * Route: GET /token-balance/:address/:tokenAddress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getTokenBalance(req, res, next) {
    try {
      // Extract parameters from URL
      const { address, tokenAddress } = req.params;
      
      logger.info(`Fetching token balance for address: ${address}, token: ${tokenAddress}`);
      
      // Call blockchain service to get token data
      const tokenData = await blockchainService.getTokenBalance(address, tokenAddress);
      
      // Send successful response with all token data
      res.json({
        address,
        tokenAddress,
        ...tokenData, // Spread operator includes balance, decimals, symbol, name
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Pass error to error handler middleware
      next(error);
    }
  }
}

// Export singleton instance of BalanceController
module.exports = new BalanceController();
