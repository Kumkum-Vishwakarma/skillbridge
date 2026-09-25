import { validationResult } from "express-validator";

// Runs after express-validator's check(...) chains have executed on a route.
// If any validation rule failed, collect all errors and respond in one shot.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

export default validate;