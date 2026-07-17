const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 8 * 60 * 60 * 1000, // 8 hours in ms
};

/**
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { token, employee } = await authService.login(email, password);

  // Set httpOnly cookie + also return token in body for clients that use localStorage
  res.cookie('jwt', token, COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: employee._id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      profileImage: employee.profileImage,
    },
  });
});

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * GET /api/auth/me — return current authenticated user
 */
const getMe = catchAsync(async (req, res) => {
  const Employee = require('../models/Employee');
  const employee = await Employee.findById(req.user.id).populate(
    'reportingManager',
    'name email designation employeeId'
  );
  res.status(200).json({ success: true, user: employee });
});

module.exports = { login, logout, getMe };
