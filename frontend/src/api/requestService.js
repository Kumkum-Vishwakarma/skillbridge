import axiosInstance from "./axiosInstance.js";

// Matches POST /api/exchange-requests (Step 6)
export const createExchangeRequest = async (payload) => {
  const { data } = await axiosInstance.post("/exchange-requests", payload);
  return data;
};

// Matches GET /api/exchange-requests/sent (Step 6)
export const getSentRequests = async () => {
  const { data } = await axiosInstance.get("/exchange-requests/sent");
  return data;
};

// Matches GET /api/exchange-requests/received (Step 6)
export const getReceivedRequests = async () => {
  const { data } = await axiosInstance.get("/exchange-requests/received");
  return data;
};

// Matches GET /api/exchange-requests/:id (Step 6)
export const getRequestById = async (requestId) => {
  const { data } = await axiosInstance.get(`/exchange-requests/${requestId}`);
  return data;
};

// Matches PATCH /api/exchange-requests/:id/accept (Step 6)
export const acceptRequest = async (requestId) => {
  const { data } = await axiosInstance.patch(
    `/exchange-requests/${requestId}/accept`
  );
  return data;
};

// Matches PATCH /api/exchange-requests/:id/reject (Step 6)
export const rejectRequest = async (requestId) => {
  const { data } = await axiosInstance.patch(
    `/exchange-requests/${requestId}/reject`
  );
  return data;
};

// Matches PATCH /api/exchange-requests/:id/cancel (Step 6)
export const cancelRequest = async (requestId) => {
  const { data } = await axiosInstance.patch(
    `/exchange-requests/${requestId}/cancel`
  );
  return data;
};