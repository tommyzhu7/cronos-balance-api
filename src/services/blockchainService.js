const { ethers } = require('ethers');
const { provider, ERC20_ABI } = require('../utils/blockchain');
const cache = require('../config/cache');
const logger = require('../utils/logger');

class BlockchainService {
  async getNativeBalance(address) {
    const cacheKey = `balance:${address}`;
    
    // Check cache first
    const cachedBalance = await cache.get(cacheKey);
    if (cachedBalance !== undefined && cachedBalance !== null) {
      logger.info(`Cache hit for native balance: ${address}`);
      return cachedBalance;
    }

    try {
      // Fetch balance from blockchain
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      
      // Cache the result
      await cache.set(cacheKey, formattedBalance);
      
      return formattedBalance;
    } catch (error) {
      logger.error('Error fetching native balance:', error);
      throw error;
    }
  }

  async getTokenBalance(address, tokenAddress) {
    const cacheKey = `token:${address}:${tokenAddress}`;
    
    // Check cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      logger.info(`Cache hit for token balance: ${address}/${tokenAddress}`);
      return cachedData;
    }

    try {
      // Create contract instance
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      // Fetch token details and balance
      const [balance, decimals, symbol, name] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol().catch(() => 'UNKNOWN'),
        contract.name().catch(() => 'Unknown Token'),
      ]);
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      const result = {
        balance: formattedBalance,
        decimals: Number(decimals),
        symbol,
        name,
        rawBalance: balance.toString(),
      };
      
      // Cache the result
      await cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      logger.error('Error fetching token balance:', error);
      
      // Handle specific errors
      if (error.code === 'CALL_EXCEPTION') {
        throw new Error('Invalid token contract address');
      }
      throw error;
    }
  }

  async clearCache(pattern) {
    // This is a simple implementation. In production, you might want
    // to implement pattern-based cache clearing
    await cache.flush();
    logger.info('Cache cleared');
  }
}

module.exports = new BlockchainService();
