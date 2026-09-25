import axiosInstance from "./axiosInstance.js";

// Matches POST /api/skills (Step 5)
export const createSkill = async (payload) => {
  const { data } = await axiosInstance.post("/skills", payload);
  return data;
};

// Matches GET /api/skills (Step 5)
export const getAllSkills = async () => {
  const { data } = await axiosInstance.get("/skills");
  return data;
};

// Matches GET /api/skills/:id (Step 5)
export const getSkillById = async (skillId) => {
  const { data } = await axiosInstance.get(`/skills/${skillId}`);
  return data;
};

// Matches GET /api/skills/me (Step 5)
export const getMySkills = async () => {
  const { data } = await axiosInstance.get("/skills/me");
  return data;
};

// Matches GET /api/skills/user/:userId (Step 5)
export const getUserSkills = async (userId) => {
  const { data } = await axiosInstance.get(`/skills/user/${userId}`);
  return data;
};

// Matches POST /api/skills/teach/:skillId (Step 5)
export const addTeachingSkill = async (skillId) => {
  const { data } = await axiosInstance.post(`/skills/teach/${skillId}`);
  return data;
};

// Matches POST /api/skills/learn/:skillId (Step 5)
export const addLearningSkill = async (skillId) => {
  const { data } = await axiosInstance.post(`/skills/learn/${skillId}`);
  return data;
};

// Matches DELETE /api/skills/teach/:skillId (Step 5)
export const removeTeachingSkill = async (skillId) => {
  const { data } = await axiosInstance.delete(`/skills/teach/${skillId}`);
  return data;
};

// Matches DELETE /api/skills/learn/:skillId (Step 5)
export const removeLearningSkill = async (skillId) => {
  const { data } = await axiosInstance.delete(`/skills/learn/${skillId}`);
  return data;
};