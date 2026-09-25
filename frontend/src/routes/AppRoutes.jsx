import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "../components/common/PublicRoute.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Profile from "../pages/Profile.jsx";
import Skills from "../pages/Skills.jsx";
import Matches from "../pages/Matches.jsx";
import ExchangeRequests from "../pages/ExchangeRequests.jsx";
import NotFound from "../pages/NotFound.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/requests" element={<ExchangeRequests />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;