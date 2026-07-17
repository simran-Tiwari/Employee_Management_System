const express = require('express');
const { body } = require('express-validator');
const {
  getEmployees,
  getDashboardStats,
  getEmployee,
  createEmployee,
  updateEmployee,
  patchEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { getReportees, assignManager } = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');
const { rbac } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation rules
const createValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Phone must be exactly 10 digits'),
  body('department').notEmpty().withMessage('Department is required'),
  body('designation').notEmpty().withMessage('Designation is required'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').isISO8601().withMessage('Valid joining date is required'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  body('role')
    .optional()
    .isIn(['super_admin', 'hr_manager', 'employee'])
    .withMessage('Invalid role'),
];

const updateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Phone must be exactly 10 digits'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  body('role')
    .optional()
    .isIn(['super_admin', 'hr_manager', 'employee'])
    .withMessage('Invalid role'),
];

// Routes
router.get('/stats', rbac('super_admin', 'hr_manager'), getDashboardStats);

router
  .route('/')
  .get(rbac('super_admin', 'hr_manager'), getEmployees)
  .post(rbac('super_admin', 'hr_manager'), createValidation, createEmployee);

router
  .route('/:id')
  .get(getEmployee) // access control handled in controller
  .put(rbac('super_admin', 'hr_manager'), updateValidation, updateEmployee)
  .patch(patchEmployee) // self or admin — access handled in controller
  .delete(rbac('super_admin'), deleteEmployee);

// Org-related sub-routes
router.get('/:id/reportees', getReportees);
router.patch('/:id/manager', rbac('super_admin'), assignManager);

module.exports = router;
