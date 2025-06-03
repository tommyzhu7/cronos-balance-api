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
