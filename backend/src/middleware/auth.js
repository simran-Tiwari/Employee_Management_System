const { verifyToken } = require('../utils/jwt');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware: verify JWT and attach req.user
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback to cookie
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  // Verify token
  const decoded = verifyToken(token);

  // Check if user still exists
  const currentUser = await Employee.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = {
    id: currentUser._id.toString(),
    email: currentUser.email,
    role: currentUser.role,
  };

  next();
});

module.exports = { protect };
