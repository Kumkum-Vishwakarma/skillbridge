import axiosInstance from "./axiosInstance.js";

// Matches GET /api/dashboard/stats (Step 8)
export const getDashboardStats = async () => {
  const { data } = await axiosInstance.get("/dashboard/stats");
  return data;
};