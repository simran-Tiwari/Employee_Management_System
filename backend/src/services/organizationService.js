const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');

/**
 * Check for circular reporting.
 * Walk up the manager chain from newManagerId.
 * If we encounter employeeId, it's circular.
 */
const checkCircularReporting = async (employeeId, newManagerId) => {
  if (!newManagerId) return; // No manager = no cycle

  // Can't report to yourself
  if (employeeId.toString() === newManagerId.toString()) {
    throw new AppError('An employee cannot be their own manager.', 400);
  }

  let cursor = newManagerId.toString();
  const visited = new Set();

  while (cursor) {
    if (visited.has(cursor)) break; // Prevent infinite loop on existing cycles
    visited.add(cursor);

    const mgr = await Employee.findById(cursor).select('reportingManager').lean();
    if (!mgr) break;

    const mgrId = mgr.reportingManager ? mgr.reportingManager.toString() : null;
    if (mgrId === employeeId.toString()) {
      throw new AppError(
        'Circular reporting detected. This assignment would create a reporting loop.',
        400
      );
    }

    cursor = mgrId;
  }
};

/**
 * Assign or change an employee's reporting manager.
 */
const assignManager = async (employeeId, newManagerId, requestingUser) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new AppError('Employee not found.', 404);

  if (newManagerId) {
    const manager = await Employee.findById(newManagerId);
    if (!manager) throw new AppError('Manager not found.', 404);

    await checkCircularReporting(employeeId, newManagerId);
  }

  employee.reportingManager = newManagerId || null;
  await employee.save();
  return employee;
};

/**
 * Get direct reportees of an employee.
 */
const getReportees = async (employeeId) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new AppError('Employee not found.', 404);

  const reportees = await Employee.find({ reportingManager: employeeId })
    .select('employeeId name email designation department status profileImage')
    .lean();

  return reportees;
};

/**
 * Build the full organization tree as nested JSON.
 */
const getOrgTree = async () => {
  const employees = await Employee.find()
    .select('employeeId name email designation department status profileImage reportingManager')
    .lean();

  // Build a map for quick lookup
  const map = {};
  employees.forEach((emp) => {
    map[emp._id.toString()] = { ...emp, children: [] };
  });

  // Build tree by attaching each employee to its manager
  const roots = [];
  employees.forEach((emp) => {
    if (emp.reportingManager) {
      const managerId = emp.reportingManager.toString();
      if (map[managerId]) {
        map[managerId].children.push(map[emp._id.toString()]);
      } else {
        // Manager is deleted or missing — treat as root
        roots.push(map[emp._id.toString()]);
      }
    } else {
      roots.push(map[emp._id.toString()]);
    }
  });

  return roots;
};

module.exports = { assignManager, getReportees, getOrgTree, checkCircularReporting };
