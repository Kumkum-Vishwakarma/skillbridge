import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const toIdSet = (skillArray) =>
  new Set(skillArray.map((skill) => skill._id.toString()));

const intersectSkills = (mySkills, otherIdSet) =>
  mySkills.filter((skill) => otherIdSet.has(skill._id.toString()));

// Computes ranked skill-exchange matches for a given user. Extracted as a
// standalone, exported function (rather than being inlined only inside the
// getMatches request handler) so other modules — specifically the Dashboard
// controller in Step 8 — can obtain the exact same match objects, computed
// by the exact same algorithm, without duplicating this logic or issuing a
// second, separate set of queries against the same underlying data.
export const computeMatches = async (userId) => {
  const currentUser = await User.findById(userId)
    .populate("teachingSkills", "name category")
    .populate("learningSkills", "name category");

  if (!currentUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const otherUsers = await User.find({ _id: { $ne: userId } })
    .select(
      "name email profilePicture bio experienceLevel teachingSkills learningSkills createdAt"
    )
    .populate("teachingSkills", "name category")
    .populate("learningSkills", "name category");

  const myTeachingIds = toIdSet(currentUser.teachingSkills);
  const myLearningIds = toIdSet(currentUser.learningSkills);

  const matches = [];

  for (const other of otherUsers) {
    const otherLearningIds = toIdSet(other.learningSkills);

    const iTeachYouWant = intersectSkills(
      currentUser.teachingSkills,
      otherLearningIds
    );
    const youTeachIWant = intersectSkills(other.teachingSkills, myLearningIds);

    const hasITeachYouWant = iTeachYouWant.length > 0;
    const hasYouTeachIWant = youTeachIWant.length > 0;

    if (!hasITeachYouWant && !hasYouTeachIWant) {
      continue;
    }

    const matchType =
      hasITeachYouWant && hasYouTeachIWant ? "perfect" : "partial";
    const matchScore = matchType === "perfect" ? 100 : 50;

    matches.push({
      user: {
        _id: other._id,
        name: other.name,
        email: other.email,
        profilePicture: other.profilePicture,
        bio: other.bio,
        experienceLevel: other.experienceLevel,
      },
      matchType,
      matchScore,
      matchingSkills: {
        iTeachYouWant,
        youTeachIWant,
      },
      createdAt: other.createdAt,
    });
  }

  matches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return { currentUser, matches };
};

// @desc    Get ranked skill-exchange matches for the logged-in user
// @route   GET /api/matches
// @access  Private
export const getMatches = asyncHandler(async (req, res) => {
  const { matches } = await computeMatches(req.user.id);

  res.status(200).json({
    success: true,
    count: matches.length,
    data: matches,
  });
});