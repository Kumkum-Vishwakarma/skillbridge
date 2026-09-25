import mongoSanitize from "express-mongo-sanitize";
import { filterXSS } from "xss";

// ── NoSQL injection protection ──────────────────────────────────────
// Strips any key starting with "$" or containing "." from req.body,
// req.query, and req.params. Without this, a request body like
// { "email": { "$gt": "" }, "password": { "$gt": "" } } could bypass
// intended query logic in a hand-rolled Mongo query (this specific
// example doesn't apply to Mongoose's schema-typed queries used
// throughout this codebase, but this middleware is a defense-in-depth
// layer protecting against this class of attack regardless of how any
// current or future query is written).
export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: "_", // replaces a stripped character rather than deleting
                     // the whole key, so legitimate-looking keys aren't
                     // silently dropped without a trace
});

// ── XSS protection ───────────────────────────────────────────────────
// Recursively walks req.body and runs every string value through
// filterXSS(), which strips/escapes <script> tags, on* event handler
// attributes, and other HTML/JS injection vectors. This protects
// free-text fields that get stored and later rendered elsewhere in the
// app — e.g. a user's `bio` (Step 4), a skill's `description` (Step 5),
// or an exchange request's `message` (Step 6) — from being used to
// inject malicious script into another user's browser when that data
// is displayed (a stored XSS attack).
const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return filterXSS(value, {
      whiteList: {}, // no HTML tags are allowed through at all
      stripIgnoreTag: true,
      stripIgnoreTagBody: ["script"],
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value !== null && typeof value === "object") {
    const sanitizedObject = {};
    for (const key of Object.keys(value)) {
      sanitizedObject[key] = sanitizeValue(value[key]);
    }
    return sanitizedObject;
  }

  return value;
};

export const xssSanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
};