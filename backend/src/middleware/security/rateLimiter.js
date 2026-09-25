import rateLimit from "express-rate-limit";

// Both limiters now skip entirely when NODE_ENV === "test". This is a
// testability-only change to production security tooling, not a
// business-logic change: outside a test run, NODE_ENV is never "test",
// so production behavior is completely unaffected. Without this, a
// test suite sending many requests to /api/auth in quick succession
// would trip the 10-per-15-minutes auth limiter and produce failures
// unrelated to any actual application bug.
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
});