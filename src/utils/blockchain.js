/**
 * Blockchain Utilities
 * Provides connection to Cronos blockchain and common ABIs
 */

const { ethers } = require('ethers');

/**
 * Create JSON-RPC provider instance for Cronos blockchain
 * Uses the RPC URL from environment variables
 */
const provider = new ethers.JsonRpcProvider(
  process.env.CRONOS_RPC_URL || 'https://evm.cronos.org'
);

/**
 * ERC20 Token ABI
 * Minimal ABI containing only the functions we need
 * This reduces bundle size and improves performance
 */
const ERC20_ABI = [
  // Get token balance for an address
  'function balanceOf(address account) view returns (uint256)',
  
  // Get token decimals (usually 18 for most tokens)
  'function decimals() view returns (uint8)',
  
  // Get token symbol (e.g., "USDC", "WETH")
  'function symbol() view returns (string)',
  
  // Get token name (e.g., "USD Coin", "Wrapped Ether")
  'function name() view returns (string)',
];

// Export utilities for use in other modules
module.exports = {
  provider,
  ERC20_ABI,
};
