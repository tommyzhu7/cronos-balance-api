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
