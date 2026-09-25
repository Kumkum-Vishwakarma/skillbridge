// Centralized HTTP status code constants — removes magic numbers from
// controllers, middleware, and the ApiError class, and gives every part
// of the codebase one shared vocabulary for status codes.
const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

export default StatusCodes;