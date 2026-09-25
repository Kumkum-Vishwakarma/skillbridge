import axiosInstance from "./axiosInstance.js";

// Matches GET /api/matches (Step 7)
export const getMatches = async () => {
  const { data } = await axiosInstance.get("/matches");
  return data;
};