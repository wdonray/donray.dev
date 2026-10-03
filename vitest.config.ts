import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      // CI fails if coverage drops below these floors.
      // Raise them as coverage improves; never lower them.
      thresholds: {
        statements: 72,
        branches: 68,
        functions: 80,
        lines: 73,
      },
    },
  },
});
