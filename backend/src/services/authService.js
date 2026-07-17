const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');

/**
 * Login: verify credentials, return JWT.
 */
const login = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password.', 400);
  }

  // Explicitly select password (it's excluded by default)
  const employee = await Employee.findOne({ email }).select('+password');
  if (!employee) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await employee.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken({ id: employee._id, email: employee.email, role: employee.role });

  return { token, employee };
};

module.exports = { login };
