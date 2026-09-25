import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get logged-in user's own profile
// @route   GET /api/users/profile
// @access  Private
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update logged-in user's own profile
// @route   PUT /api/users/profile
// @access  Private
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, bio, location, profilePicture, experienceLevel } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only touch fields that were actually sent — supports partial updates
  // (e.g. a request that only changes `bio` shouldn't wipe out `location`).
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;
  if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;

  // .save() re-runs schema validators (minlength, enum, etc.) and triggers
  // the pre("save") hook — but that hook only re-hashes if password was
  // modified, which it isn't here, so this is safe and cheap.
  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

// @desc    Get any user's public profile by ID
// @route   GET /api/users/:id
// @access  Private (any authenticated user)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});