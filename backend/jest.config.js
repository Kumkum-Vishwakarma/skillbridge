export default {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/env.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000,
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
};