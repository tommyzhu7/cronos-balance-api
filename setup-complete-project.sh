#!/bin/bash

# setup-complete-project.sh - 自动创建完整的Cronos Blockchain API项目

set -e  # 遇到错误立即退出

echo "🚀 开始设置完整的Cronos Blockchain API项目..."
echo "================================================"

# 检查是否在正确的目录
read -p "将在当前目录创建项目文件，是否继续？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消"
    exit 1
fi

# 创建目录结构
echo "📁 创建目录结构..."
mkdir -p src/{config,controllers,middlewares,routes,services,utils}
mkdir -p tests/{unit/{controllers,middlewares,services},integration}
mkdir -p .github/workflows

# 创建 package.json
echo "📝 创建 package.json..."
cat > package.json << 'EOF'
{
  "name": "cronos-blockchain-api",
  "version": "1.0.0",
  "description": "Secure Node.js API for interacting with Cronos blockchain",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/"
  },
  "keywords": ["cronos", "blockchain", "api", "cro", "crc20"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "ethers": "^6.9.0",
    "joi": "^17.11.0",
    "node-cache": "^5.1.2",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "winston": "^3.11.0",
    "swagger-ui-express": "^5.0.0",
    "swagger-jsdoc": "^6.2.8",
    "redis": "^4.6.11"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.2",
    "eslint": "^8.55.0"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/index.js"
    ]
  }
}
EOF

# 创建 .env.example
echo "📝 创建 .env.example..."
cat > .env.example << 'EOF'
NODE_ENV=development
PORT=3000

# API Keys (comma-separated for multiple keys)
API_KEYS=your-api-key-1,your-api-key-2,your-api-key-3

# Cronos RPC Endpoints
CRONOS_RPC_URL=https://evm.cronos.org

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour in milliseconds
RATE_LIMIT_MAX_REQUESTS=100

# Caching
CACHE_TTL_SECONDS=300  # 5 minutes
CACHE_CHECK_PERIOD=60  # Check for expired cache entries every 60 seconds

# Redis (optional)
USE_REDIS=false
REDIS_URL=redis://localhost:6379
EOF

# 创建 .env
echo "📝 创建 .env..."
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000

# API Keys (comma-separated for multiple keys)
API_KEYS=test-api-key-1,test-api-key-2,test-api-key-3

# Cronos RPC Endpoints
CRONOS_RPC_URL=https://evm.cronos.org

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour in milliseconds
RATE_LIMIT_MAX_REQUESTS=100

# Caching
CACHE_TTL_SECONDS=300  # 5 minutes
CACHE_CHECK_PERIOD=60  # Check for expired cache entries every 60 seconds

# Redis (optional)
USE_REDIS=false
REDIS_URL=redis://localhost:6379
EOF

# 创建 src/index.js
echo "📝 创建 src/index.js..."
cat > src/index.js << 'EOF'
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
EOF

# 创建 src/config/swagger.js
echo "📝 创建 src/config/swagger.js..."
cat > src/config/swagger.js << 'EOF'
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cronos Blockchain API',
      version: '1.0.0',
      description: 'A secure API for interacting with the Cronos blockchain',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
    security: [
      {
        apiKey: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
EOF

# 创建 src/config/cache.js
echo "📝 创建 src/config/cache.js..."
cat > src/config/cache.js << 'EOF'
const NodeCache = require('node-cache');
const redis = require('redis');
const logger = require('../utils/logger');

let cache;

if (process.env.USE_REDIS === 'true') {
  // Redis implementation
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  client.on('error', (err) => logger.error('Redis Client Error', err));
  client.connect();

  cache = {
    get: async (key) => {
      try {
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        logger.error('Redis get error:', error);
        return null;
      }
    },
    set: async (key, value, ttl = process.env.CACHE_TTL_SECONDS || 300) => {
      try {
        await client.setEx(key, ttl, JSON.stringify(value));
        return true;
      } catch (error) {
        logger.error('Redis set error:', error);
        return false;
      }
    },
    del: async (key) => {
      try {
        await client.del(key);
        return true;
      } catch (error) {
        logger.error('Redis del error:', error);
        return false;
      }
    },
    flush: async () => {
      try {
        await client.flushAll();
        return true;
      } catch (error) {
        logger.error('Redis flush error:', error);
        return false;
      }
    },
  };
} else {
  // Node-cache implementation
  const nodeCache = new NodeCache({
    stdTTL: process.env.CACHE_TTL_SECONDS || 300,
    checkperiod: process.env.CACHE_CHECK_PERIOD || 60,
  });

  cache = {
    get: async (key) => nodeCache.get(key),
    set: async (key, value, ttl) => nodeCache.set(key, value, ttl),
    del: async (key) => nodeCache.del(key),
    flush: async () => nodeCache.flushAll(),
  };
}

module.exports = cache;
EOF

# 创建 src/utils/logger.js
echo "📝 创建 src/utils/logger.js..."
cat > src/utils/logger.js << 'EOF'
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

module.exports = logger;
EOF

# 创建 src/utils/blockchain.js
echo "📝 创建 src/utils/blockchain.js..."
cat > src/utils/blockchain.js << 'EOF'
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
EOF

# 创建 src/utils/validators.js
echo "📝 创建 src/utils/validators.js..."
cat > src/utils/validators.js << 'EOF'
const Joi = require('joi');

const ethereumAddress = Joi.string()
  .pattern(/^0x[a-fA-F0-9]{40}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid Ethereum address format',
    'any.required': 'Address is required',
  });

const schemas = {
  address: Joi.object({
    address: ethereumAddress,
  }),
  tokenBalance: Joi.object({
    address: ethereumAddress,
    tokenAddress: ethereumAddress,
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
      });
    }
    next();
  };
};

module.exports = {
  schemas,
  validate,
};
EOF

# 创建 src/middlewares/auth.js
echo "📝 创建 src/middlewares/auth.js..."
cat > src/middlewares/auth.js << 'EOF'
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required',
    });
  }

  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  if (!validApiKeys.includes(apiKey)) {
    logger.warn(`Invalid API key attempt: ${apiKey}`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
  }

  req.apiKey = apiKey;
  next();
};

module.exports = authenticate;
EOF

# 创建 src/middlewares/rateLimiter.js
echo "📝 创建 src/middlewares/rateLimiter.js..."
cat > src/middlewares/rateLimiter.js << 'EOF'
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Store for tracking requests per API key
const rateLimitStore = new Map();

const createRateLimiter = () => {
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000, // 1 hour
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    keyGenerator: (req) => req.apiKey || req.ip,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for API key: ${req.apiKey}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      });
    },
    skip: (req) => !req.apiKey, // Skip if no API key (will be caught by auth)
  });
};

module.exports = createRateLimiter;
EOF

# 创建 src/middlewares/errorHandler.js
echo "📝 创建 src/middlewares/errorHandler.js..."
cat > src/middlewares/errorHandler.js << 'EOF'
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Unable to connect to blockchain RPC',
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
};

module.exports = errorHandler;
EOF

# 创建 src/services/blockchainService.js
echo "📝 创建 src/services/blockchainService.js..."
cat > src/services/blockchainService.js << 'EOF'
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
EOF

# 创建 src/services/analyticsService.js
echo "📝 创建 src/services/analyticsService.js..."
cat > src/services/analyticsService.js << 'EOF'
const cache = require('../config/cache');
const logger = require('../utils/logger');

class AnalyticsService {
  constructor() {
    this.requestCounts = new Map();
  }

  async trackRequest(apiKey, endpoint) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const key = `analytics:${apiKey}:${date}`;
      
      // Increment request count
      const current = await cache.get(key) || { 
        total: 0, 
        endpoints: {} 
      };
      
      current.total++;
      current.endpoints[endpoint] = (current.endpoints[endpoint] || 0) + 1;
      
      await cache.set(key, current, 86400); // 24 hours
      
      // Also track in memory for quick access
      const memKey = `${apiKey}:${date}`;
      if (!this.requestCounts.has(memKey)) {
        this.requestCounts.set(memKey, { total: 0, endpoints: {} });
      }
      
      const memStats = this.requestCounts.get(memKey);
      memStats.total++;
      memStats.endpoints[endpoint] = (memStats.endpoints[endpoint] || 0) + 1;
      
    } catch (error) {
      logger.error('Error tracking analytics:', error);
    }
  }

  async getUsageStats(apiKey, days = 7) {
    const stats = [];
    const endDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const key = `analytics:${apiKey}:${dateStr}`;
      const dayStats = await cache.get(key) || { total: 0, endpoints: {} };
      
      stats.push({
        date: dateStr,
        ...dayStats,
      });
    }
    
    return {
      apiKey,
      period: `${days} days`,
      stats: stats.reverse(),
      summary: {
        totalRequests: stats.reduce((sum, day) => sum + day.total, 0),
        averagePerDay: Math.round(stats.reduce((sum, day) => sum + day.total, 0) / days),
      },
    };
  }
}

module.exports = new AnalyticsService();
EOF

# 创建 src/controllers/balanceController.js
echo "📝 创建 src/controllers/balanceController.js..."
cat > src/controllers/balanceController.js << 'EOF'
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
EOF

# 创建 src/routes/index.js
echo "📝 创建 src/routes/index.js..."
cat > src/routes/index.js << 'EOF'
const express = require('express');
const balanceRoutes = require('./balanceRoutes');
const authenticate = require('../middlewares/auth');
const createRateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(authenticate);
router.use(createRateLimiter());

// Mount route modules
router.use('/', balanceRoutes);

module.exports = router;
EOF

# 创建 src/routes/balanceRoutes.js
echo "📝 创建 src/routes/balanceRoutes.js..."
cat > src/routes/balanceRoutes.js << 'EOF'
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
EOF

# 创建 src/middlewares/analytics.js
echo "📝 创建 src/middlewares/analytics.js..."
cat > src/middlewares/analytics.js << 'EOF'
const analyticsService = require('../services/analyticsService');

const trackAnalytics = (req, res, next) => {
  if (req.apiKey) {
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    analyticsService.trackRequest(req.apiKey, endpoint);
  }
  next();
};

module.exports = trackAnalytics;
EOF

# 创建测试文件
echo "📝 创建测试文件..."

# tests/unit/validators.test.js
cat > tests/unit/validators.test.js << 'EOF'
const { schemas } = require('../../src/utils/validators');

describe('Validators', () => {
  describe('Address validation', () => {
    it('should validate correct Ethereum address', () => {
      const result = schemas.address.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
      });
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid Ethereum address', () => {
      const result = schemas.address.validate({
        address: '0xinvalid',
      });
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Invalid Ethereum address format');
    });

    it('should reject missing address', () => {
      const result = schemas.address.validate({});
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Address is required');
    });
  });

  describe('Token balance validation', () => {
    it('should validate correct addresses', () => {
      const result = schemas.tokenBalance.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      });
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid token address', () => {
      const result = schemas.tokenBalance.validate({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89026',
        tokenAddress: 'invalid',
      });
      expect(result.error).toBeDefined();
    });
  });
});
EOF

# tests/unit/services/blockchainService.test.js
cat > tests/unit/services/blockchainService.test.js << 'EOF'
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
EOF

# tests/unit/middlewares/auth.test.js
cat > tests/unit/middlewares/auth.test.js << 'EOF'
const authenticate = require('../../../src/middlewares/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.API_KEYS = 'test-key-1,test-key-2';
  });

  it('should pass with valid API key', () => {
    req.headers['x-api-key'] = 'test-key-1';

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.apiKey).toBe('test-key-1');
  });

  it('should reject request without API key', () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'API key is required',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with invalid API key', () => {
    req.headers['x-api-key'] = 'invalid-key';

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
EOF

# tests/unit/controllers/balanceController.test.js
cat > tests/unit/controllers/balanceController.test.js << 'EOF'
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
EOF

# tests/unit/middlewares/errorHandler.test.js
cat > tests/unit/middlewares/errorHandler.test.js << 'EOF'
const errorHandler = require('../../../src/middlewares/errorHandler');
const logger = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle validation errors', () => {
    const error = new Error('Invalid input');
    error.name = 'ValidationError';

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation Error',
      message: 'Invalid input',
    });
  });

  it('should handle RPC connection errors', () => {
    const error = new Error('Connection refused');
    error.code = 'ECONNREFUSED';

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Service Unavailable',
      message: 'Unable to connect to blockchain RPC',
    });
  });

  it('should handle general errors', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });
});
EOF

# tests/unit/middlewares/rateLimiter.test.js
cat > tests/unit/middlewares/rateLimiter.test.js << 'EOF'
const createRateLimiter = require('../../../src/middlewares/rateLimiter');

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    process.env.RATE_LIMIT_WINDOW_MS = '3600000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '100';
  });

  it('should create rate limiter with correct configuration', () => {
    const rateLimiter = createRateLimiter();
    expect(rateLimiter).toBeDefined();
    expect(typeof rateLimiter).toBe('function');
  });
});
EOF

# tests/integration/api.test.js
cat > tests/integration/api.test.js << 'EOF'
const request = require('supertest');
const app = require('../../src/index');
const cache = require('../../src/config/cache');
const { provider } = require('../../src/utils/blockchain');

jest.mock('../../src/config/cache');
jest.mock('../../src/utils/blockchain');

describe('API Integration Tests', () => {
  const validApiKey = process.env.API_KEYS?.split(',')[0] || 'test-key';
  const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f89026';

  beforeEach(() => {
    jest.clearAllMocks();
    cache.get.mockResolvedValue(null);
    cache.set.mockResolvedValue(true);
  });

  describe('GET /api/v1/balance/:address', () => {
    it('should return native balance with valid request', async () => {
      provider.getBalance = jest.fn().mockResolvedValue(BigInt('1500000000000000000'));

      const response = await request(app)
        .get(`/api/v1/balance/${testAddress}`)
        .set('x-api-key', validApiKey);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        address: testAddress,
        balance: '1.5',
        symbol: 'CRO',
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return 401 without API key', async () => {
      const response = await request(app)
        .get(`/api/v1/balance/${testAddress}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid address', async () => {
      const response = await request(app)
        .get('/api/v1/balance/invalid-address')
        .set('x-api-key', validApiKey);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
EOF

# 创建其他配置文件
echo "📝 创建配置文件..."

# .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
coverage/
*.log
.DS_Store
dist/
build/
.vscode/
.idea/
EOF

# .eslintrc.js
cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
EOF

# README.md
cat > README.md << 'EOF'
# Cronos Blockchain API

A secure and performant Node.js backend API for interacting with the Cronos (EVM) blockchain to fetch native CRO and CRC20 token balances.

## Features

- ✅ Fetch native CRO token balance
- ✅ Fetch CRC20 token balances with metadata
- ✅ API key authentication
- ✅ Rate limiting (100 requests per hour per API key)
- ✅ In-memory caching with configurable TTL
- ✅ Input validation for Ethereum addresses
- ✅ Comprehensive error handling
- ✅ Swagger API documentation
- ✅ Unit and integration tests with Jest
- ✅ Production-ready logging with Winston
- ✅ Optional Redis support for caching
- ✅ Docker support

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Run the application:
```bash
npm run dev  # Development mode
npm start    # Production mode
```

4. Access API documentation:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Get Native CRO Balance
```bash
GET /api/v1/balance/:address
```

### Get CRC20 Token Balance
```bash
GET /api/v1/token-balance/:address/:tokenAddress
```

## Testing

```bash
npm test  # Run all tests with coverage
npm run test:watch  # Watch mode
```

## Docker

```bash
# Using Docker Compose
docker-compose up

# Manual build
docker build -t cronos-api .
docker run -p 3000:3000 --env-file .env cronos-api
```

## License

ISC
EOF

# Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "src/index.js"]
EOF

# docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - USE_REDIS=true
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
EOF

# .github/workflows/ci.yml
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-node-
    
    - run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      if: matrix.node-version == '18.x'
      with:
        file: ./coverage/lcov.info
        fail_ci_if_error: true

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t cronos-api .
    
    - name: Run Docker container
      run: |
        docker run -d -p 3000:3000 --name test-api \
          -e API_KEYS=test-key \
          -e NODE_ENV=production \
          cronos-api
    
    - name: Health check
      run: |
        sleep 5
        curl -f http://localhost:3000/health || exit 1
    
    - name: Stop container
      run: docker stop test-api
EOF

echo ""
echo "✅ 所有文件创建完成！"
echo ""
echo "📋 下一步操作："
echo "1. 安装依赖："
echo "   npm install"
echo ""
echo "2. 运行应用："
echo "   npm run dev"
echo ""
echo "3. 测试API："
echo "   curl http://localhost:3000/health"
echo ""
echo "4. 查看API文档："
echo "   http://localhost:3000/api-docs"
echo ""
echo "5. 运行测试："
echo "   npm test"
echo ""
echo "⚠️  注意：默认API密钥是 'test-api-key-1', 'test-api-key-2', 'test-api-key-3'"
echo "   请在生产环境中修改 .env 文件中的 API_KEYS"
echo ""
echo "🎉 项目设置完成！"
