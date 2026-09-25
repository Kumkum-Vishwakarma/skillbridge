import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/auth/Register.jsx";

vi.mock("../../hooks/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../hooks/useAuth.js";

describe("Register form validation", () => {
  it("blocks submission and shows an error when passwords don't match, without calling register()", async () => {
    const registerMock = vi.fn();
    useAuth.mockReturnValue({ register: registerMock });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password123");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "DifferentPass1"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("blocks submission for a password under 8 characters", async () => {
    const registerMock = vi.fn();
    useAuth.mockReturnValue({ register: registerMock });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "short1");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "short1");
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    expect(
      await screen.findByText(/at least 8 characters/i)
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("calls register() with valid, matching data", async () => {
    const registerMock = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ register: registerMock });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password123");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "Password123"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    expect(registerMock).toHaveBeenCalledWith({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Password123",
    });
  });
});