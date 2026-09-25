// Wraps an async controller function so any thrown error (or rejected Promise)
// is automatically forwarded to Express's error-handling middleware via next().
// Without this, every controller would need its own try/catch block.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


export default asyncHandler;