// Inspects any error thrown by axios (network failure, HTTP error
// response, or something unexpected) and returns one predictable shape:
//   { message: string, fieldErrors: [{ field, message }] | null, status: number | null }
export const normalizeApiError = (error) => {
  if (!error.response) {
    return {
      message:
        "Unable to reach the server. Please check your connection and try again.",
      fieldErrors: null,
      status: null,
    };
  }

  const { status, data } = error.response;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return {
      message: data.message || "Validation failed",
      fieldErrors: data.errors,
      status,
    };
  }

  if (data?.message) {
    return {
      message: data.message,
      fieldErrors: null,
      status,
    };
  }

  return {
    message: "Something went wrong. Please try again.",
    fieldErrors: null,
    status,
  };
};