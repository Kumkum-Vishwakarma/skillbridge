import mongoose from "mongoose";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Create a new skill in the shared catalog
// @route   POST /api/skills
// @access  Private (any authenticated user can contribute to the catalog)
export const createSkill = asyncHandler(async (req, res) => {
  const { name, category, description } = req.body;

  // Explicit friendly duplicate check BEFORE hitting the DB's unique index.
  // The collation index below still protects us on a race condition
  // (two identical requests at the same instant), but this check gives a
  // clean, expected error message in the normal case rather than relying
  // solely on the errorMiddleware's generic 11000 handler.
  const existingSkill = await Skill.findOne({ name }).collation({
    locale: "en",
    strength: 2,
  });

  if (existingSkill) {
    res.status(400);
    throw new Error(`Skill "${existingSkill.name}" already exists`);
  }

  const skill = await Skill.create({ name, category, description });

  res.status(201).json({
    success: true,
    data: skill,
  });
});

// @desc    Get all skills in the catalog
// @route   GET /api/skills
// @access  Private
export const getAllSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find().sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: skills,
  });
});

// @desc    Get a single skill by ID
// @route   GET /api/skills/:id
// @access  Private
export const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  res.status(200).json({
    success: true,
    data: skill,
  });
});

// @desc    Add a skill to the logged-in user's "teaching" list
// @route   POST /api/skills/teach/:skillId
// @access  Private
export const addTeachingSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;

  const skill = await Skill.findById(skillId);
  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  const user = await User.findById(req.user.id);

  // Prevent adding the same skill twice — .some() compares ObjectIds via
  // .equals() since array elements here are ObjectId instances, not strings.
  const alreadyAdded = user.teachingSkills.some((id) => id.equals(skillId));
  if (alreadyAdded) {
    res.status(400);
    throw new Error("Skill already in your teaching list");
  }

  user.teachingSkills.push(skillId);
  await user.save();

  const updatedUser = await User.findById(req.user.id).populate(
    "teachingSkills",
    "name category description"
  );

  res.status(200).json({
    success: true,
    data: updatedUser.teachingSkills,
  });
});

// @desc    Add a skill to the logged-in user's "learning" list
// @route   POST /api/skills/learn/:skillId
// @access  Private
export const addLearningSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;

  const skill = await Skill.findById(skillId);
  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  const user = await User.findById(req.user.id);

  const alreadyAdded = user.learningSkills.some((id) => id.equals(skillId));
  if (alreadyAdded) {
    res.status(400);
    throw new Error("Skill already in your learning list");
  }

  user.learningSkills.push(skillId);
  await user.save();

  const updatedUser = await User.findById(req.user.id).populate(
    "learningSkills",
    "name category description"
  );

  res.status(200).json({
    success: true,
    data: updatedUser.learningSkills,
  });
});

// @desc    Remove a skill from the logged-in user's "teaching" list
// @route   DELETE /api/skills/teach/:skillId
// @access  Private
export const removeTeachingSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;

  const user = await User.findById(req.user.id);

  const wasPresent = user.teachingSkills.some((id) => id.equals(skillId));
  if (!wasPresent) {
    res.status(400);
    throw new Error("Skill not found in your teaching list");
  }

  user.teachingSkills = user.teachingSkills.filter(
    (id) => !id.equals(skillId)
  );
  await user.save();

  res.status(200).json({
    success: true,
    data: user.teachingSkills,
  });
});

// @desc    Remove a skill from the logged-in user's "learning" list
// @route   DELETE /api/skills/learn/:skillId
// @access  Private
export const removeLearningSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;

  const user = await User.findById(req.user.id);

  const wasPresent = user.learningSkills.some((id) => id.equals(skillId));
  if (!wasPresent) {
    res.status(400);
    throw new Error("Skill not found in your learning list");
  }

  user.learningSkills = user.learningSkills.filter(
    (id) => !id.equals(skillId)
  );
  await user.save();

  res.status(200).json({
    success: true,
    data: user.learningSkills,
  });
});

// @desc    Get the logged-in user's own teaching + learning skills
// @route   GET /api/skills/me
// @access  Private
export const getMySkills = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("teachingSkills", "name category description")
    .populate("learningSkills", "name category description");

  res.status(200).json({
    success: true,
    data: {
      teachingSkills: user.teachingSkills,
      learningSkills: user.learningSkills,
    },
  });
});

// @desc    Get another user's teaching + learning skills
// @route   GET /api/skills/user/:userId
// @access  Private
export const getUserSkills = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .populate("teachingSkills", "name category description")
    .populate("learningSkills", "name category description");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    data: {
      teachingSkills: user.teachingSkills,
      learningSkills: user.learningSkills,
    },
  });
});