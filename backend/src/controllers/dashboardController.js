import mongoose from "mongoose";
import ExchangeRequest from "../models/ExchangeRequest.js";
import asyncHandler from "../utils/asyncHandler.js";
import { computeMatches } from "./matchController.js";
import { populateRequest } from "./exchangeRequestController.js";

// $facet results come back as either [{ count: N }] or [] (when zero
// documents matched that branch) — this normalizes both cases to a plain
// number so the response never has to special-case an empty array.
const extractCount = (facetBranchResult) =>
  facetBranchResult.length > 0 ? facetBranchResult[0].count : 0;

// @desc    Get aggregated dashboard statistics for the logged-in user
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // All four independent data sources are fetched concurrently. None of
  // these four operations depends on another's result, so running them
  // sequentially with separate `await`s would only add latency with no
  // benefit. This is also what keeps the query count fixed and low
  // regardless of how many skills or requests the user has — no loop ever
  // issues a query per document, so there is no N+1 risk anywhere here.
  const [matchData, statsFacet, recentSentRequests, recentReceivedRequests] =
    await Promise.all([
      // Reuses the exact same matching algorithm and query pattern as
      // GET /api/matches (Step 7) — no second, duplicate implementation.
      computeMatches(userId),

      // A single aggregation query computes every request-status count in
      // one round trip to MongoDB, instead of seven separate
      // countDocuments() calls.
      ExchangeRequest.aggregate([
        {
          $match: {
            $or: [{ requester: userObjectId }, { receiver: userObjectId }],
          },
        },
        {
          $facet: {
            sentTotal: [
              { $match: { requester: userObjectId } },
              { $count: "count" },
            ],
            receivedTotal: [
              { $match: { receiver: userObjectId } },
              { $count: "count" },
            ],
            pendingSent: [
              { $match: { requester: userObjectId, status: "pending" } },
              { $count: "count" },
            ],
            pendingReceived: [
              { $match: { receiver: userObjectId, status: "pending" } },
              { $count: "count" },
            ],
            accepted: [
              { $match: { status: "accepted" } },
              { $count: "count" },
            ],
            rejected: [
              { $match: { status: "rejected" } },
              { $count: "count" },
            ],
            cancelled: [
              { $match: { status: "cancelled" } },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Reuses the exact same populateRequest helper as the Exchange
      // Request module, guaranteeing identical population shape.
      populateRequest(
        ExchangeRequest.find({ requester: userId })
          .sort({ createdAt: -1 })
          .limit(5)
      ),

      populateRequest(
        ExchangeRequest.find({ receiver: userId })
          .sort({ createdAt: -1 })
          .limit(5)
      ),
    ]);

  const { currentUser, matches } = matchData;
  const facet = statsFacet[0];

  res.status(200).json({
    success: true,
    data: {
      totalTeachingSkills: currentUser.teachingSkills.length,
      totalLearningSkills: currentUser.learningSkills.length,
      totalSentRequests: extractCount(facet.sentTotal),
      totalReceivedRequests: extractCount(facet.receivedTotal),
      pendingRequestsSent: extractCount(facet.pendingSent),
      pendingRequestsReceived: extractCount(facet.pendingReceived),
      acceptedExchanges: extractCount(facet.accepted),
      rejectedRequests: extractCount(facet.rejected),
      cancelledRequests: extractCount(facet.cancelled),
      smartMatchCount: matches.length,
      recentSentRequests,
      recentReceivedRequests,
      // matches is already sorted highest-score-first inside computeMatches,
      // so the top 5 highest-scoring matches are simply the first 5 entries —
      // no second sort or second query needed.
      recentMatches: matches.slice(0, 5),
    },
  });
});