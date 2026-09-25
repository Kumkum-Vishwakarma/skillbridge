import StatusCodes from "../utils/statusCodes.js";

// Handles requests to routes that don't exist.
// Unchanged in behavior from Step 8 — still produces a 404 with a clear
// message; now simply expressed using the shared StatusCodes constant.
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = StatusCodes.NOT_FOUND;
  next(error);
};

// Centralized error handler — every thrown/forwarded error, from any
// layer of the application, ends up here. Must be registered LAST in
// app.js, after all routes. This function classifies the error by type
// and produces one guaranteed, consistent response shape:
//   { success: false, message: string, errors?: [{ field, message }] }
export const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || (res.statusCode === 200 ? StatusCodes.INTERNAL_SERVER_ERROR : res.statusCode);
  let message = err.message || "Something went wrong";
  let fieldErrors = err.fieldErrors || undefined;

  // ── ApiError instances (new, optional pattern from this step) ──────
  // Already carry the correct statusCode/message/fieldErrors from above;
  // no further transformation needed for this branch.

  // ── Mongoose CastError (malformed ObjectId in a URL param) ─────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = StatusCodes.NOT_FOUND;
    message = "Resource not found";
  }

  // ── MongoDB duplicate key error (e.g. registering an existing email,
  //    or creating a skill name that already exists case-insensitively) ──
  if (err.code === 11000) {
    statusCode = StatusCodes.BAD_REQUEST;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // ── Mongoose schema validation error (multi-field) ──────────────────
  if (err.name === "ValidationError" && err.errors) {
    statusCode = StatusCodes.BAD_REQUEST;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(", ");
    fieldErrors = Object.entries(err.errors).map(([field, val]) => ({
      field,
      message: val.message,
    }));
  }

  // ── JWT errors ───────────────────────────────────────────────────────
  // Under the current authMiddleware.js (Step 3, unchanged by this step),
  // these are already caught internally and rethrown as a generic
  // "Not authorized, invalid or expired token" Error — so in today's
  // codebase these three branches are a defense-in-depth safety net,
  // not something that fires on the current authMiddleware code path.
  // They exist so that ANY future code that verifies a JWT and lets the
  // raw jsonwebtoken error propagate is still handled correctly and
  // consistently, without needing another edit to this file later.
  if (err.name === "JsonWebTokenError") {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = "Invalid authentication token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = "Authentication token has expired";
  }
  if (err.name === "NotBeforeError") {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = "Authentication token is not yet active";
  }

  // ── Truly unexpected errors ──────────────────────────────────────────
  // Anything that reaches this point without a recognizable name/code
  // and without an explicit statusCode is an unanticipated bug, not a
  // handled business case. It is deliberately reported as a generic
  // 500 with a safe, non-leaking message in production, while still
  // logging the full error server-side for diagnosis.
  const isUnrecognized =
    !err.statusCode &&
    err.name !== "CastError" &&
    err.code !== 11000 &&
    err.name !== "ValidationError" &&
    err.name !== "JsonWebTokenError" &&
    err.name !== "TokenExpiredError" &&
    err.name !== "NotBeforeError" &&
    statusCode === StatusCodes.INTERNAL_SERVER_ERROR;

  if (isUnrecognized) {
    console.error("[Unhandled Error]", err);
    if (process.env.NODE_ENV !== "development") {
      message = "An unexpected error occurred. Please try again later.";
    }
  }

  const response = {
    success: false,
    message,
  };

  if (fieldErrors) {
    response.errors = fieldErrors;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};