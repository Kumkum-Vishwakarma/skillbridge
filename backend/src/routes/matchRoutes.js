import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getMatches } from "../controllers/matchController.js";

const router = express.Router();

// ── GET /api/matches ─────────────────────────────────────────
router.get("/", protect, getMatches);

export default router;