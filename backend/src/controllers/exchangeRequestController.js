import ExchangeRequest from "../models/ExchangeRequest.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// Shared population config so every response has the exact same shape,
// as required: requester/receiver (name, email, profilePicture),
// offeredSkill/requestedSkill (name, category). Exported so other modules
// (the Dashboard controller in Step 8) can reuse the exact same population
// shape for "recent requests" instead of duplicating this chain.
export const populateRequest = (query) =>
  query
    .populate("requester", "name email profilePicture")
    .populate("receiver", "name email profilePicture")
    .populate("offeredSkill", "name category")
    .populate("requestedSkill", "name category");

// @desc    Send a new exchange request
// @route   POST /api/exchange-requests
// @access  Private
export const createExchangeRequest = asyncHandler(async (req, res) => {
  const { receiver, offeredSkill, requestedSkill, message, scheduledDate } =
    req.body;
  const requesterId = req.user.id;

  if (requesterId === receiver) {
    res.status(400);
    throw new Error("You cannot send an exchange request to yourself");
  }

  const [offeredSkillDoc, requestedSkillDoc, receiverUser] = await Promise.all([
    Skill.findById(offeredSkill),
    Skill.findById(requestedSkill),
    User.findById(receiver),
  ]);

  if (!offeredSkillDoc) {
    res.status(404);
    throw new Error("Offered skill not found");
  }
  if (!requestedSkillDoc) {
    res.status(404);
    throw new Error("Requested skill not found");
  }
  if (!receiverUser) {
    res.status(404);
    throw new Error("Receiver not found");
  }

  const requesterUser = await User.findById(requesterId);
  const requesterTeachesOffered = requesterUser.teachingSkills.some((id) =>
    id.equals(offeredSkill)
  );
  if (!requesterTeachesOffered) {
    res.status(400);
    throw new Error("You can only offer a skill that is in your teaching list");
  }

  const receiverTeachesRequested = receiverUser.teachingSkills.some((id) =>
    id.equals(requestedSkill)
  );
  if (!receiverTeachesRequested) {
    res.status(400);
    throw new Error(
      "The receiver does not teach the requested skill"
    );
  }

  const duplicate = await ExchangeRequest.findOne({
    requester: requesterId,
    receiver,
    offeredSkill,
    requestedSkill,
    status: "pending",
  });
  if (duplicate) {
    res.status(400);
    throw new Error(
      "A pending request for this skill exchange already exists"
    );
  }

  const exchangeRequest = await ExchangeRequest.create({
    requester: requesterId,
    receiver,
    offeredSkill,
    requestedSkill,
    message,
    scheduledDate: scheduledDate || null,
  });

  const populated = await populateRequest(
    ExchangeRequest.findById(exchangeRequest._id)
  );

  res.status(201).json({
    success: true,
    data: populated,
  });
});

// @desc    Get all requests the logged-in user has SENT
// @route   GET /api/exchange-requests/sent
// @access  Private
export const getMySentRequests = asyncHandler(async (req, res) => {
  const requests = await populateRequest(
    ExchangeRequest.find({ requester: req.user.id }).sort({ createdAt: -1 })
  );

  res.status(200).json({
    success: true,
    data: requests,
  });
});

// @desc    Get all requests the logged-in user has RECEIVED
// @route   GET /api/exchange-requests/received
// @access  Private
export const getMyReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await populateRequest(
    ExchangeRequest.find({ receiver: req.user.id }).sort({ createdAt: -1 })
  );

  res.status(200).json({
    success: true,
    data: requests,
  });
});

// @desc    Get a single exchange request by ID
// @route   GET /api/exchange-requests/:id
// @access  Private (only the requester or receiver involved)
export const getExchangeRequestById = asyncHandler(async (req, res) => {
  const request = await populateRequest(
    ExchangeRequest.findById(req.params.id)
  );

  if (!request) {
    res.status(404);
    throw new Error("Exchange request not found");
  }

  const isParticipant =
    request.requester._id.toString() === req.user.id ||
    request.receiver._id.toString() === req.user.id;

  if (!isParticipant) {
    res.status(403);
    throw new Error("You are not authorized to view this request");
  }

  res.status(200).json({
    success: true,
    data: request,
  });
});

// @desc    Accept a received exchange request
// @route   PATCH /api/exchange-requests/:id/accept
// @access  Private (receiver only)
export const acceptExchangeRequest = asyncHandler(async (req, res) => {
  const request = await ExchangeRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Exchange request not found");
  }

  if (request.receiver.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Only the receiver can accept this request");
  }

  if (request.status !== "pending") {
    res.status(400);
    throw new Error(`Cannot accept a request that is already ${request.status}`);
  }

  request.status = "accepted";
  await request.save();

  const populated = await populateRequest(
    ExchangeRequest.findById(request._id)
  );

  res.status(200).json({
    success: true,
    data: populated,
  });
});

// @desc    Reject a received exchange request
// @route   PATCH /api/exchange-requests/:id/reject
// @access  Private (receiver only)
export const rejectExchangeRequest = asyncHandler(async (req, res) => {
  const request = await ExchangeRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Exchange request not found");
  }

  if (request.receiver.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Only the receiver can reject this request");
  }

  if (request.status !== "pending") {
    res.status(400);
    throw new Error(`Cannot reject a request that is already ${request.status}`);
  }

  request.status = "rejected";
  await request.save();

  const populated = await populateRequest(
    ExchangeRequest.findById(request._id)
  );

  res.status(200).json({
    success: true,
    data: populated,
  });
});

// @desc    Cancel a sent exchange request
// @route   PATCH /api/exchange-requests/:id/cancel
// @access  Private (requester only)
export const cancelExchangeRequest = asyncHandler(async (req, res) => {
  const request = await ExchangeRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Exchange request not found");
  }

  if (request.requester.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Only the requester can cancel this request");
  }

  if (request.status !== "pending") {
    res.status(400);
    throw new Error(`Cannot cancel a request that is already ${request.status}`);
  }

  request.status = "cancelled";
  await request.save();

  const populated = await populateRequest(
    ExchangeRequest.findById(request._id)
  );

  res.status(200).json({
    success: true,
    data: populated,
  });
});