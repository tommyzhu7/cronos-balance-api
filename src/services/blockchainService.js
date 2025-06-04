/**
 * Blockchain Service
 * Handles all interactions with the Cronos blockchain
 * Implements caching to reduce RPC calls and improve performance
 */

const { ethers } = require('ethers');
const { provider, ERC20_ABI } = require('../utils/blockchain');
const cache = require('../config/cache');
const logger = require('../utils/logger');

/**
 * Blockchain Service Class
 * Provides methods to fetch balances from the blockchain
 */
class BlockchainService {
  /**
   * Get native CRO balance for an address
   * @param {string} address - Ethereum address to check
   * @returns {Promise<string>} Balance in CRO (formatted as string)
   */
  async getNativeBalance(address) {
    // Generate cache key for this address
    const cacheKey = `balance:${address}`;
    
    // Check if balance is cached
    const cachedBalance = await cache.get(cacheKey);
    if (cachedBalance !== undefined && cachedBalance !== null) {
      logger.info(`Cache hit for native balance: ${address}`);
      return cachedBalance;
    }

    try {
      // Fetch balance from blockchain
      // Returns balance in wei (smallest unit)
      const balance = await provider.getBalance(address);
      
      // Convert from wei to CRO (1 CRO = 10^18 wei)
      const formattedBalance = ethers.formatEther(balance);
      
      // Cache the result for future requests
      await cache.set(cacheKey, formattedBalance);
      
      logger.info(`Fetched native balance for ${address}: ${formattedBalance} CRO`);
      return formattedBalance;
    } catch (error) {
      logger.error('Error fetching native balance:', error);
      throw error;
    }
  }

  /**
   * Get CRC20 token balance for an address
   * @param {string} address - Wallet address to check
   * @param {string} tokenAddress - Token contract address
   * @returns {Promise<Object>} Token balance and metadata
   */
  async getTokenBalance(address, tokenAddress) {
    // Generate cache key for this address/token combination
    const cacheKey = `token:${address}:${tokenAddress}`;
    
    // Check if token data is cached
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      logger.info(`Cache hit for token balance: ${address}/${tokenAddress}`);
      return cachedData;
    }

    try {
      // Create contract instance with ABI and provider
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      // Fetch all token data in parallel for efficiency
      // Use Promise.all to make concurrent RPC calls
      const [balance, decimals, symbol, name] = await Promise.all([
        // Get raw balance (in smallest unit)
        contract.balanceOf(address),
        
        // Get number of decimals (usually 18 for most tokens)
        contract.decimals(),
        
        // Get token symbol (with fallback for tokens without symbol)
        contract.symbol().catch(() => 'UNKNOWN'),
        
        // Get token name (with fallback for tokens without name)
        contract.name().catch(() => 'Unknown Token'),
      ]);
      
      // Format balance based on token decimals
      // e.g., if decimals=6 and balance=1000000, formatted=1.0
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      // Prepare response object with all token data
      const result = {
        balance: formattedBalance,
        decimals: Number(decimals),
        symbol,
        name,
        rawBalance: balance.toString(), // Include raw balance for precision
      };
      
      // Cache the result for future requests
      await cache.set(cacheKey, result);
      
      logger.info(`Fetched token balance for ${address}/${tokenAddress}: ${formattedBalance} ${symbol}`);
      return result;
    } catch (error) {
      logger.error('Error fetching token balance:', error);
      
      // Handle specific error cases with meaningful messages
      if (error.code === 'CALL_EXCEPTION') {
        throw new Error('Invalid token contract address');
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Clear cache entries
   * @param {string} pattern - Optional pattern to match (not implemented)
   * @returns {Promise<void>}
   */
  async clearCache(pattern) {
    // Simple implementation clears all cache
    // In production, you might want pattern-based clearing
    await cache.flush();
    logger.info('Cache cleared');
  }
}

// Export singleton instance of BlockchainService
module.exports = new BlockchainService();
