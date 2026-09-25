import axiosInstance from "./axiosInstance.js";

// Matches GET /api/users/profile (Step 4)
export const getMyProfile = async () => {
  const { data } = await axiosInstance.get("/users/profile");
  return data;
};

// Matches PUT /api/users/profile (Step 4)
export const updateMyProfile = async (payload) => {
  const { data } = await axiosInstance.put("/users/profile", payload);
  return data;
};

// Matches GET /api/users/:id (Step 4)
export const getUserById = async (userId) => {
  const { data } = await axiosInstance.get(`/users/${userId}`);
  return data;
};