import express from "express";
import { body } from "express-validator";
import {
  createSkill,
  getAllSkills,
  getSkillById,
  addTeachingSkill,
  addLearningSkill,
  removeTeachingSkill,
  removeLearningSkill,
  getMySkills,
  getUserSkills,
} from "../controllers/skillController.js";
import validate from "../middleware/validateMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkObjectId.js";
import { SKILL_CATEGORIES } from "../models/Skill.js";

const router = express.Router();

// ── POST /api/skills ─────────────────────────────────────────
router.post(
  "/",
  protect,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Skill name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Skill name must be between 2 and 50 characters"),
    body("category")
      .notEmpty()
      .withMessage("Category is required")
      .isIn(SKILL_CATEGORIES)
      .withMessage(`Category must be one of: ${SKILL_CATEGORIES.join(", ")}`),
    body("description")
      .optional()
      .isLength({ max: 300 })
      .withMessage("Description cannot exceed 300 characters"),
  ],
  validate,
  createSkill
);

// ── GET /api/skills ───────────────────────────────────────────
router.get("/", protect, getAllSkills);

// ── GET /api/skills/me ─────────────────────────────────────────
// Must be declared BEFORE /:id, or Express will try to match "me" as an :id
router.get("/me", protect, getMySkills);

// ── GET /api/skills/user/:userId ────────────────────────────────
router.get(
  "/user/:userId",
  protect,
  checkObjectId("userId"),
  getUserSkills
);

// ── GET /api/skills/:id ───────────────────────────────────────
router.get("/:id", protect, checkObjectId("id"), getSkillById);

// ── POST /api/skills/teach/:skillId ─────────────────────────────
router.post(
  "/teach/:skillId",
  protect,
  checkObjectId("skillId"),
  addTeachingSkill
);

// ── POST /api/skills/learn/:skillId ─────────────────────────────
router.post(
  "/learn/:skillId",
  protect,
  checkObjectId("skillId"),
  addLearningSkill
);

// ── DELETE /api/skills/teach/:skillId ───────────────────────────
router.delete(
  "/teach/:skillId",
  protect,
  checkObjectId("skillId"),
  removeTeachingSkill
);

// ── DELETE /api/skills/learn/:skillId ───────────────────────────
router.delete(
  "/learn/:skillId",
  protect,
  checkObjectId("skillId"),
  removeLearningSkill
);

export default router;