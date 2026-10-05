import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Unit tests run in jsdom, which has no View Transitions API.
      // Stub the library as thin passthroughs so component tests keep
      // asserting on rendered anchors without pulling in the real module
      // (its internal next/link import breaks vitest's resolver).
      "next-view-transitions": path.resolve(
        __dirname,
        "src/test-utils/next-view-transitions-stub.tsx",
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      // Test utilities are not production code.
      exclude: ["src/test-utils/**"],
      // 100% across the board. CI fails if coverage drops.
      // Thresholds only go up; never lower them.
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
