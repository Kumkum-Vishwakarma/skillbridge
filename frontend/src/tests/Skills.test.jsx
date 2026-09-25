import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Skills from "../pages/Skills.jsx";

vi.mock("../api/skillService.js", () => ({
  getAllSkills: vi.fn(),
  getMySkills: vi.fn(),
  createSkill: vi.fn(),
  addTeachingSkill: vi.fn(),
  addLearningSkill: vi.fn(),
  removeTeachingSkill: vi.fn(),
  removeLearningSkill: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import {
  getAllSkills,
  getMySkills,
  createSkill,
} from "../api/skillService.js";
import toast from "react-hot-toast";

describe("Skills page — API integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllSkills.mockResolvedValue({
      data: [{ _id: "skill1", name: "React", category: "Programming" }],
    });
    getMySkills.mockResolvedValue({
      data: { teachingSkills: [], learningSkills: [] },
    });
  });

  it("renders skills fetched from the catalog service", async () => {
    render(<Skills />);

    expect(await screen.findByText("React")).toBeInTheDocument();
    expect(getAllSkills).toHaveBeenCalledTimes(1);
    expect(getMySkills).toHaveBeenCalledTimes(1);
  });

  it("submits a new skill and shows a success toast", async () => {
    createSkill.mockResolvedValue({
      data: { _id: "skill2", name: "Node.js", category: "Programming" },
    });

    render(<Skills />);
    await screen.findByText("React");

    await userEvent.type(
      screen.getByPlaceholderText(/skill name/i),
      "Node.js"
    );
    await userEvent.click(screen.getByRole("button", { name: /add skill/i }));

    await waitFor(() => {
      expect(createSkill).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Node.js" })
      );
    });
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Node.js")
    );
  });

  it("shows a client-side error for a skill name under 2 characters, without calling the API", async () => {
    render(<Skills />);
    await screen.findByText("React");

    await userEvent.type(screen.getByPlaceholderText(/skill name/i), "A");
    await userEvent.click(screen.getByRole("button", { name: /add skill/i }));

    expect(
      await screen.findByText(/between 2 and 50 characters/i)
    ).toBeInTheDocument();
    expect(createSkill).not.toHaveBeenCalled();
  });
});