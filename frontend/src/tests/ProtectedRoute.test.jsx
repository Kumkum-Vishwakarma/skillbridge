import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import PublicRoute from "../components/common/PublicRoute.jsx";

// Mocks the exact hook module ProtectedRoute/PublicRoute both import,
// so each test controls the auth state directly without needing a real
// AuthProvider or any API call.
vi.mock("../hooks/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../hooks/useAuth.js";

const renderWithRoutes = (initialPath) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<div>Login Page</div>} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("Route protection", () => {
  it("redirects an unauthenticated user away from a protected route", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    renderWithRoutes("/dashboard");

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders the protected page for an authenticated user", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    renderWithRoutes("/dashboard");

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("redirects an authenticated user away from a public-only route", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    renderWithRoutes("/login");

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("shows nothing but a loader while auth state is still resolving", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });

    renderWithRoutes("/dashboard");

    expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });
});