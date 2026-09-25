import express from "express";
import { body } from "express-validator";
import {
  createExchangeRequest,
  getMySentRequests,
  getMyReceivedRequests,
  getExchangeRequestById,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
} from "../controllers/exchangeRequestController.js";
import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validateMiddleware.js";
import checkObjectId from "../middleware/checkObjectId.js";

const router = express.Router();

// ── POST /api/exchange-requests ─────────────────────────────
router.post(
  "/",
  protect,
  [
    body("receiver").isMongoId().withMessage("A valid receiver ID is required"),
    body("offeredSkill")
      .isMongoId()
      .withMessage("A valid offeredSkill ID is required"),
    body("requestedSkill")
      .isMongoId()
      .withMessage("A valid requestedSkill ID is required"),
    body("message")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Message cannot exceed 500 characters"),
    body("scheduledDate")
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage("scheduledDate must be a valid date"),
  ],
  validate,
  createExchangeRequest
);

// ── GET /api/exchange-requests/sent ─────────────────────────
// Static segments declared before the dynamic /:id route below.
router.get("/sent", protect, getMySentRequests);

// ── GET /api/exchange-requests/received ─────────────────────
router.get("/received", protect, getMyReceivedRequests);

// ── GET /api/exchange-requests/:id ───────────────────────────
router.get("/:id", protect, checkObjectId("id"), getExchangeRequestById);

// ── PATCH /api/exchange-requests/:id/accept ─────────────────
router.patch(
  "/:id/accept",
  protect,
  checkObjectId("id"),
  acceptExchangeRequest
);

// ── PATCH /api/exchange-requests/:id/reject ─────────────────
router.patch(
  "/:id/reject",
  protect,
  checkObjectId("id"),
  rejectExchangeRequest
);

// ── PATCH /api/exchange-requests/:id/cancel ─────────────────
router.patch(
  "/:id/cancel",
  protect,
  checkObjectId("id"),
  cancelExchangeRequest
);

export default router;