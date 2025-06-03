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
