// Inspects any error thrown by axios (network failure, HTTP error
// response, or something unexpected) and returns one predictable shape:
//   { message: string, fieldErrors: [{ field, message }] | null, status: number | null }
//
// This is the single place in the frontend that understands every shape
// an API error can take, so no component or interceptor needs to
// duplicate that inspection logic.
export const normalizeApiError = (error) => {
  // ── No response at all: network failure, CORS block, server down ──
  if (!error.response) {
    return {
      message:
        "Unable to reach the server. Please check your connection and try again.",
      fieldErrors: null,
      status: null,
    };
  }

  const { status, data } = error.response;

  // ── express-validator style: { success:false, message, errors:[{field,message}] } ──
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return {
      message: data.message || "Validation failed",
      fieldErrors: data.errors,
      status,
    };
  }

  // ── Standard backend error shape: { success:false, message } ──
  if (data?.message) {
    return {
      message: data.message,
      fieldErrors: null,
      status,
    };
  }

  // ── Anything else unexpected ──
  return {
    message: "Something went wrong. Please try again.",
    fieldErrors: null,
    status,
  };
};