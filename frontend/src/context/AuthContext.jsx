import { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
} from "../api/authService.js";
import { getToken, setToken, removeToken } from "../utils/tokenStorage.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUser();
        setUser(response.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    setToken(response.token);
    setUser(response.user);
    toast.success("Logged in successfully");
    return response;
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    setToken(response.token);
    setUser(response.user);
    toast.success("Account created successfully");
    return response;
  };

  const logout = () => {
    removeToken();
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateUser = (updatedFields) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedFields }));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};