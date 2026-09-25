import mongoose from "mongoose";

const exchangeRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offeredSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    requestedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Speeds up the two most common queries this module makes:
// "all requests I sent" and "all requests I received".
exchangeRequestSchema.index({ requester: 1, status: 1 });
exchangeRequestSchema.index({ receiver: 1, status: 1 });

// Prevents a duplicate PENDING request for the exact same offer/ask pair
// between the same two people at the database level — a safety net behind
// the controller-level check (see createExchangeRequest below), guarding
// against race conditions from near-simultaneous duplicate requests.
exchangeRequestSchema.index(
  { requester: 1, receiver: 1, offeredSkill: 1, requestedSkill: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

const ExchangeRequest = mongoose.model("ExchangeRequest", exchangeRequestSchema);

export default ExchangeRequest;