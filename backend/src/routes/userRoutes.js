import express from "express";
import { body } from "express-validator";
import {
  getMyProfile,
  updateMyProfile,
  getUserById,
} from "../controllers/userController.js";
import validate from "../middleware/validateMiddleware.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ── GET /api/users/profile ──────────────────────────────────
router.get("/profile", protect, getMyProfile);

// ── PUT /api/users/profile ──────────────────────────────────
router.put(
  "/profile",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("bio")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Bio cannot exceed 500 characters"),
    body("profilePicture")
      .optional({ checkFalsy: true }) // allows "" to clear the picture without failing isURL
      .isURL()
      .withMessage("Profile picture must be a valid URL"),
    body("experienceLevel")
      .optional()
      .isIn(["Beginner", "Intermediate", "Advanced"])
      .withMessage("Experience level must be Beginner, Intermediate, or Advanced"),
    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location cannot exceed 100 characters"),
  ],
  validate,
  updateMyProfile
);

// ── GET /api/users/:id ───────────────────────────────────────
router.get("/:id", protect, getUserById);

export default router;