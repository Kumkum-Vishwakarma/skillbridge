import express from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../controllers/authController.js";
import validate from "../middleware/validateMiddleware.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// A strong-password regex requiring at least one lowercase letter, one
// uppercase letter, and one digit. Special characters are NOT mandated —
// requiring them tends to push users toward predictable substitutions
// (e.g. "Password1!") without meaningfully improving real-world
// resistance to guessing, while significantly hurting usability. Length
// plus mixed case plus a digit is a well-established, evidence-backed
// balance between security and usability for this kind of consumer app.
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

// ── POST /api/auth/register ─────────────────────────────────
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 72 })
      .withMessage(
        "Password must be between 8 and 72 characters"
      )
      .matches(STRONG_PASSWORD_REGEX)
      .withMessage(
        "Password must include at least one uppercase letter, one lowercase letter, and one number"
      ),
  ],
  validate,
  registerUser
);

// ── POST /api/auth/login ────────────────────────────────────
router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginUser
);

// ── GET /api/auth/me ────────────────────────────────────────
router.get("/me", protect, getCurrentUser);

export default router;