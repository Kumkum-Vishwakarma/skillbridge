import User from "../../src/models/User.js";
import Skill from "../../src/models/Skill.js";
import generateToken from "../../src/utils/generateToken.js";

// Creates a real, persisted user (password hashed via the model's own
// pre("save") hook, unchanged since Step 3) and returns it alongside a
// valid JWT, so tests can immediately make authenticated requests
// without going through the HTTP register/login flow every time.
export const createUser = async (overrides = {}) => {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const user = await User.create({
    name: overrides.name || "Test User",
    email: overrides.email || `test-${uniqueSuffix}@example.com`,
    password: overrides.password || "Password123",
    ...overrides,
  });
  const token = generateToken(user._id);
  return { user, token };
};

export const createSkill = async (overrides = {}) => {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return Skill.create({
    name: overrides.name || `Skill-${uniqueSuffix}`,
    category: overrides.category || "Programming",
    description: overrides.description || "",
  });
};