/**
 * Wraps an async route handler to forward errors to Express error middleware.
 * Usage: router.get('/path', catchAsync(async (req, res, next) => { ... }))
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
