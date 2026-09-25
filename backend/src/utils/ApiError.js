import StatusCodes from "./statusCodes.js";

// A structured, throwable error carrying its own HTTP status code and an
// `isOperational` flag. "Operational" errors are expected, handled failure
// cases (bad input, not found, unauthorized) — as opposed to genuine bugs
// or unexpected exceptions, which should NOT be marked operational.
// errorMiddleware.js uses `isOperational` to decide how much detail is
// safe to expose to the client.
//
// This class is available for any NEW backend code to use going forward.
// It does not replace or require changes to any existing controller —
// the existing `res.status(x); throw new Error(...)` pattern in every
// Step 3-8 controller continues to work exactly as before, because
// errorMiddleware.js (below) still supports both styles.
class ApiError extends Error {
  constructor(
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    message = "Something went wrong",
    isOperational = true,
    fieldErrors = null
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.fieldErrors = fieldErrors; // optional array of { field, message }
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, fieldErrors = null) {
    return new ApiError(StatusCodes.BAD_REQUEST, message, true, fieldErrors);
  }

  static unauthorized(message = "Not authorized") {
    return new ApiError(StatusCodes.UNAUTHORIZED, message, true);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(StatusCodes.FORBIDDEN, message, true);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(StatusCodes.NOT_FOUND, message, true);
  }

  static conflict(message = "Conflict") {
    return new ApiError(StatusCodes.CONFLICT, message, true);
  }

  static internal(message = "Internal server error") {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message, false);
  }
}

export default ApiError;