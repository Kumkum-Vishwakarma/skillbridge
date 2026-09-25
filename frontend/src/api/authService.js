import axiosInstance from "./axiosInstance.js";

// Matches POST /api/auth/register (Step 3)
export const registerUser = async (payload) => {
  const { data } = await axiosInstance.post("/auth/register", payload);
  return data;
};

// Matches POST /api/auth/login (Step 3)
export const loginUser = async (payload) => {
  const { data } = await axiosInstance.post("/auth/login", payload);
  return data;
};

// Matches GET /api/auth/me (Step 3)
export const fetchCurrentUser = async () => {
  const { data } = await axiosInstance.get("/auth/me");
  return data;
};