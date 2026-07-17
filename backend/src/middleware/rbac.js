const AppError = require('../utils/AppError');

/**
 * RBAC middleware factory.
 * Usage: rbac('super_admin', 'hr_manager')
 * Must be used AFTER the `protect` middleware.
 */
const rbac = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { rbac };
