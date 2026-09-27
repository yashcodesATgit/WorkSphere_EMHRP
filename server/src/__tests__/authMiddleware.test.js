import { jest } from '@jest/globals';

// Setup mocks before importing the module under test
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn(),
  },
}));

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    findById: jest.fn(),
  },
}));

// Import the module dynamically to ensure it uses the mocked versions
const { protect } = await import('../middleware/authMiddleware.js');
const jwt = (await import('jsonwebtoken')).default;
const User = (await import('../models/User.js')).default;

describe('Auth Middleware (protect)', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if authorization header is missing', async () => {
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not authenticated. Token missing.' });
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    req.headers.authorization = 'InvalidTokenFormat';
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not authenticated. Token missing.' });
  });

  it('should return 401 if token is invalid or expired', async () => {
    req.headers.authorization = 'Bearer invalidtoken123';
    jwt.verify.mockImplementation(() => {
      const error = new Error();
      error.name = 'TokenExpiredError';
      throw error;
    });

    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Token expired.' });
  });

  it('should return 401 if user is not found or inactive', async () => {
    req.headers.authorization = 'Bearer validtoken123';
    jwt.verify.mockReturnValue({ id: 'userid123' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found or inactive.' });
  });

  it('should call next() and attach user to req if token is valid', async () => {
    req.headers.authorization = 'Bearer validtoken123';
    const mockUser = { _id: 'userid123', isActive: true, role: 'EMPLOYEE' };
    
    jwt.verify.mockReturnValue({ id: 'userid123' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    await protect(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(mockUser);
  });
});
