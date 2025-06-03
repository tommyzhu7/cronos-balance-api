const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider(process.env.CRONOS_RPC_URL);

// ABI for ERC20 balanceOf function
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

module.exports = {
  provider,
  ERC20_ABI,
};
