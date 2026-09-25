import axios from "axios";
import toast from "react-hot-toast";
import { normalizeApiError } from "../utils/normalizeApiError.js";
import { getToken, removeToken } from "../utils/tokenStorage.js";

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  // Fails loudly and immediately if the app is somehow built/run without
  // its required API base URL configured, rather than silently making
  // every request fail with a confusing network error later.
  throw new Error(
    "VITE_API_URL is not defined. Check your .env file before starting the app."
  );
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds — prevents a hung request from leaving a
                   // page's loading state spinning indefinitely if the
                   // backend becomes unresponsive without returning any
                   // error at all
  withCredentials: false, // this app authenticates via a Bearer token in
                           // the Authorization header, not cookies — set
                           // explicitly (rather than left as an implicit
                           // default) so no cookie is ever sent
                           // cross-origin, which is correct for this
                           // architecture and avoids any accidental
                           // cookie-based CSRF surface
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach the JWT to every outgoing request ──
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: centralized, normalized error handling ──
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { message, status } = normalizeApiError(error);

    if (status === 401) {
      removeToken();

      const onAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!onAuthPage) {
        toast.error("Your session has expired. Please log in again.");
        window.location.href = "/login";
      } else {
        toast.error(message);
      }
    } else {
      toast.error(message);
    }

    error.normalized = normalizeApiError(error);

    return Promise.reject(error);
  }
);

export default axiosInstance;