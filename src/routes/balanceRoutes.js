/**
 * Balance Routes
 * Defines endpoints for fetching CRO and token balances
 * Includes OpenAPI documentation for each endpoint
 */

const express = require('express');
const balanceController = require('../controllers/balanceController');
const { schemas, validate } = require('../utils/validators');

// Create router instance for balance routes
const router = express.Router();

/**
 * @swagger
 * /balance/{address}:
 *   get:
 *     summary: Get native CRO balance
 *     description: Retrieve the native CRO token balance for a given wallet address
 *     tags:
 *       - Balances
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address
 *         example: "0x742d35Cc6634C0532925a3b844Bc9e7595f89026"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   description: The wallet address
 *                   example: "0x742d35Cc6634C0532925a3b844Bc9e7595f89026"
 *                 balance:
 *                   type: string
 *                   description: Balance in CRO
 *                   example: "123.456789123456789"
 *                 symbol:
 *                   type: string
 *                   description: Currency symbol
 *                   example: "CRO"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Response timestamp
 *                   example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid address format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Validation Error"
 *                 message:
 *                   type: string
 *                   example: "Invalid Ethereum address format"
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       429:
 *         description: Rate limit exceeded
 *       503:
 *         description: Service unavailable - RPC connection error
 */
router.get(
  '/balance/:address',
  validate(schemas.address), // Validate address parameter
  balanceController.getNativeBalance // Handle request
);

/**
 * @swagger
 * /token-balance/{address}/{tokenAddress}:
 *   get:
 *     summary: Get CRC20 token balance
 *     description: Retrieve the CRC20 token balance for a given wallet and token address
 *     tags:
 *       - Balances
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address
 *         example: "0x742d35Cc6634C0532925a3b844Bc9e7595f89026"
 *       - in: path
 *         name: tokenAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: CRC20 token contract address
 *         example: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   description: The wallet address
 *                   example: "0x742d35Cc6634C0532925a3b844Bc9e7595f89026"
 *                 tokenAddress:
 *                   type: string
 *                   description: The token contract address
 *                   example: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
 *                 balance:
 *                   type: string
 *                   description: Formatted token balance
 *                   example: "1000.50"
 *                 decimals:
 *                   type: number
 *                   description: Token decimal places
 *                   example: 6
 *                 symbol:
 *                   type: string
 *                   description: Token symbol
 *                   example: "USDC"
 *                 name:
 *                   type: string
 *                   description: Token name
 *                   example: "USD Coin"
 *                 rawBalance:
 *                   type: string
 *                   description: Raw balance without decimal formatting
 *                   example: "1000500000"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Response timestamp
 *                   example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid address format or invalid token contract
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       429:
 *         description: Rate limit exceeded
 *       503:
 *         description: Service unavailable - RPC connection error
 */
router.get(
  '/token-balance/:address/:tokenAddress',
  validate(schemas.tokenBalance), // Validate both address parameters
  balanceController.getTokenBalance // Handle request
);

// Export the router with all balance routes
module.exports = router;
