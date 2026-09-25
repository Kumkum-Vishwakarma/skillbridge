import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Matches from "../pages/Matches.jsx";

vi.mock("../api/matchService.js", () => ({
  getMatches: vi.fn(),
}));

import { getMatches } from "../api/matchService.js";

const renderMatches = () =>
  render(
    <MemoryRouter>
      <Matches />
    </MemoryRouter>
  );

describe("Matches page — loading and error states", () => {
  it("shows a loading indicator before data resolves", async () => {
    let resolvePromise;
    getMatches.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { container } = renderMatches();

    // Loader renders a spinning div with no accessible text — assert by
    // its absence of match content rather than by role, matching how
    // the actual Loader component (Step 9) is implemented.
    expect(screen.queryByText(/find matches/i)).not.toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();

    resolvePromise({ data: [] });
    await waitFor(() =>
      expect(screen.getByText(/find matches/i)).toBeInTheDocument()
    );
  });

  it("shows the inline error panel with a working retry button on fetch failure", async () => {
    getMatches.mockRejectedValueOnce({
      response: { data: { message: "Server exploded" } },
    });

    renderMatches();

    expect(await screen.findByText("Server exploded")).toBeInTheDocument();

    getMatches.mockResolvedValueOnce({ data: [] });
    const retryButton = screen.getByRole("button", { name: /try again/i });
    retryButton.click();

    await waitFor(() =>
      expect(screen.getByText(/find matches/i)).toBeInTheDocument()
    );
  });

  it("shows the empty state when zero matches are returned", async () => {
    getMatches.mockResolvedValue({ data: [] });

    renderMatches();

    expect(await screen.findByText(/no matches yet/i)).toBeInTheDocument();
  });
});