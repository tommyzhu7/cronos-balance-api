const request = require('supertest');
const cache = require('../../src/config/cache');
const { provider } = require('../../src/utils/blockchain');

jest.mock('../../src/config/cache');
jest.mock('../../src/utils/blockchain');

describe('API Integration Tests', () => {
  let app;
  const validApiKey = 'test-key';
  const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f89026';

  beforeAll(() => {
    // Set test environment
    process.env.API_KEYS = validApiKey;
    process.env.NODE_ENV = 'test';
    process.env.USE_REDIS = 'false';
    
    // Require app after setting environment
    app = require('../../src/index');
  });

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
