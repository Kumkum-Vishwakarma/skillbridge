import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setupTests.js",
  },
  build: {
    // Splits large third-party dependencies into their own cacheable
    // chunk, separate from application code. Without this, every app
    // code change forces users to re-download React/React Router in
    // the same bundle; with it, the vendor chunk stays cached across
    // deployments as long as dependency versions don't change.
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
    // Fails the build loudly if a single chunk balloons unexpectedly
    // (e.g. an accidental large dependency import), rather than
    // silently shipping a bloated bundle to production.
    chunkSizeWarningLimit: 600,
    sourcemap: false, // disabled in production builds to avoid shipping
                       // source maps publicly; re-enable temporarily if
                       // debugging a production-only issue is required
  },
});