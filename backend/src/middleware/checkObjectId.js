import mongoose from "mongoose";

// Reusable middleware factory: validates that a given route param is a
// well-formed MongoDB ObjectId BEFORE it ever reaches a controller/query.
// Usage: router.get("/:id", checkObjectId("id"), controllerFn)
const checkObjectId = (paramName) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName}`,
    });
  }
  next();
};

export default checkObjectId;