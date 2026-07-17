const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');

/**
 * List employees with search, filter, sort, pagination.
 */
const getEmployees = async (query) => {
  const {
    search,
    department,
    role,
    status,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 10,
  } = query;

  // Always exclude soft-deleted employees.
  // countDocuments() bypasses the pre-find middleware, so we set it explicitly here.
  const filter = { isDeleted: false };

  // Search by name or email
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (department) filter.department = { $regex: department, $options: 'i' };
  if (role) filter.role = role;
  if (status) filter.status = status;

  const sortOrder = order === 'asc' ? 1 : -1;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate('reportingManager', 'name email designation employeeId')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Employee.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get a single employee by ID.
 */
const getEmployeeById = async (id) => {
  const employee = await Employee.findById(id).populate(
    'reportingManager',
    'name email designation employeeId'
  );
  if (!employee) throw new AppError('Employee not found.', 404);
  return employee;
};

/**
 * Create a new employee.
 */
const createEmployee = async (data) => {
  const existing = await Employee.findOne({ email: data.email });
  if (existing) throw new AppError('Email already in use.', 409);

  const employee = await Employee.create(data);
  return employee;
};

/**
 * Update an employee (full or partial).
 */
const updateEmployee = async (id, data, requestingUser) => {
  const employee = await Employee.findById(id);
  if (!employee) throw new AppError('Employee not found.', 404);

  // Self-edit: employees can only update limited fields
  if (requestingUser.role === 'employee') {
    const allowedFields = ['name', 'phone', 'profileImage'];
    Object.keys(data).forEach((key) => {
      if (!allowedFields.includes(key)) delete data[key];
    });
  }

  // Prevent HR from assigning super_admin role
  if (requestingUser.role === 'hr_manager' && data.role === 'super_admin') {
    throw new AppError('HR Managers cannot assign the Super Admin role.', 403);
  }

  Object.assign(employee, data);
  await employee.save();
  return employee;
};

/**
 * Soft delete an employee.
 */
const deleteEmployee = async (id) => {
  const employee = await Employee.findById(id);
  if (!employee) throw new AppError('Employee not found.', 404);
  employee.isDeleted = true;
  await employee.save();
  return employee;
};

/**
 * Get dashboard stats.
 * NOTE: countDocuments() and distinct() bypass the pre-find middleware,
 * so we must explicitly filter { isDeleted: false } in every call.
 */
const getDashboardStats = async () => {
  const [total, active, inactive, departments] = await Promise.all([
    Employee.countDocuments({ isDeleted: false }),
    Employee.countDocuments({ isDeleted: false, status: 'active' }),
    Employee.countDocuments({ isDeleted: false, status: 'inactive' }),
    Employee.distinct('department', { isDeleted: false }),
  ]);

  // Employees per department (only non-deleted)
  const departmentBreakdown = await Employee.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    total,
    active,
    inactive,
    departments,           // full list of department names
    departmentCount: departments.length,
    departmentBreakdown,
  };
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDashboardStats,
};
