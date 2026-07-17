const { validationResult } = require('express-validator');
const employeeService = require('../services/employeeService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Helper: throw 400 if validation errors exist.
 */
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new AppError(messages.join('. '), 400);
  }
};

/**
 * GET /api/employees
 */
const getEmployees = catchAsync(async (req, res) => {
  const result = await employeeService.getEmployees(req.query);
  res.status(200).json({ success: true, ...result });
});

/**
 * GET /api/employees/stats
 */
const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await employeeService.getDashboardStats();
  res.status(200).json({ success: true, data: stats });
});

/**
 * GET /api/employees/:id
 */
const getEmployee = catchAsync(async (req, res) => {
  // Employees can only view their own profile
  if (req.user.role === 'employee' && req.user.id !== req.params.id) {
    throw new AppError('Access denied. You can only view your own profile.', 403);
  }

  const employee = await employeeService.getEmployeeById(req.params.id);
  res.status(200).json({ success: true, data: employee });
});

/**
 * POST /api/employees
 */
const createEmployee = catchAsync(async (req, res) => {
  checkValidation(req);
  const employee = await employeeService.createEmployee(req.body);
  res.status(201).json({ success: true, message: 'Employee created successfully', data: employee });
});

/**
 * PUT /api/employees/:id
 */
const updateEmployee = catchAsync(async (req, res) => {
  checkValidation(req);
  const employee = await employeeService.updateEmployee(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, message: 'Employee updated successfully', data: employee });
});

/**
 * PATCH /api/employees/:id — partial update (self-edit or admin)
 */
const patchEmployee = catchAsync(async (req, res) => {
  // Employees can only edit themselves
  if (req.user.role === 'employee' && req.user.id !== req.params.id) {
    throw new AppError('Access denied. You can only edit your own profile.', 403);
  }
  const employee = await employeeService.updateEmployee(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, message: 'Employee updated successfully', data: employee });
});

/**
 * DELETE /api/employees/:id — soft delete
 */
const deleteEmployee = catchAsync(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  res.status(200).json({ success: true, message: 'Employee deleted successfully' });
});

module.exports = {
  getEmployees,
  getDashboardStats,
  getEmployee,
  createEmployee,
  updateEmployee,
  patchEmployee,
  deleteEmployee,
};
