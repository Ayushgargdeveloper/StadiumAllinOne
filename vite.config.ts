import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      thresholds: {
        statements: 98,
        branches: 95,
        functions: 98,
        lines: 98
      },
      exclude: ["src/main.tsx", "src/test/**", "**/*.d.ts"]
    }
  }
});
