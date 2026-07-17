const orgService = require('../services/organizationService');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/organization/tree
 */
const getOrgTree = catchAsync(async (req, res) => {
  const tree = await orgService.getOrgTree();
  res.status(200).json({ success: true, data: tree });
});

/**
 * GET /api/employees/:id/reportees
 */
const getReportees = catchAsync(async (req, res) => {
  const reportees = await orgService.getReportees(req.params.id);
  res.status(200).json({ success: true, data: reportees });
});

/**
 * PATCH /api/employees/:id/manager
 */
const assignManager = catchAsync(async (req, res) => {
  const { managerId } = req.body;
  const employee = await orgService.assignManager(req.params.id, managerId, req.user);
  res.status(200).json({
    success: true,
    message: 'Manager assigned successfully',
    data: employee,
  });
});

module.exports = { getOrgTree, getReportees, assignManager };
