const express = require('express');
const balanceController = require('../controllers/balanceController');
const { schemas, validate } = require('../utils/validators');

const router = express.Router();

/**
 * @swagger
 * /balance/{address}:
 *   get:
 *     summary: Get native CRO balance
 *     description: Retrieve the native CRO token balance for a given wallet address
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address
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
 *                 balance:
 *                   type: string
 *                 symbol:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: Invalid address format
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       429:
 *         description: Rate limit exceeded
 *       503:
 *         description: Service unavailable - RPC connection error
 */
router.get(
  '/balance/:address',
  validate(schemas.address),
  balanceController.getNativeBalance
);

/**
 * @swagger
 * /token-balance/{address}/{tokenAddress}:
 *   get:
 *     summary: Get CRC20 token balance
 *     description: Retrieve the CRC20 token balance for a given wallet and token address
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address
 *       - in: path
 *         name: tokenAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: CRC20 token contract address
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
 *                 tokenAddress:
 *                   type: string
 *                 balance:
 *                   type: string
 *                 decimals:
 *                   type: number
 *                 symbol:
 *                   type: string
 *                 name:
 *                   type: string
 *                 rawBalance:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: Invalid address format
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       429:
 *         description: Rate limit exceeded
 *       503:
 *         description: Service unavailable - RPC connection error
 */
router.get(
  '/token-balance/:address/:tokenAddress',
  validate(schemas.tokenBalance),
  balanceController.getTokenBalance
);

module.exports = router;
