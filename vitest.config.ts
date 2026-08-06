import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { optimizeDepsInclude } from "./.storybook/main";
import { mockModules } from "./.storybook/mock-modules";

const root = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
    },
  },
  // storybook プロジェクトは .storybook/main.ts の viteFinal を読まないので、
  // dep の遅延最適化によるページリロード（テストが落ちる）をここでも防ぐ
  optimizeDeps: { include: optimizeDepsInclude },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          globals: true,
          environment: "jsdom",
          include: ["{src,tests}/**/*.{test,spec}.{ts,tsx}"],
          setupFiles: "./src/test/setup.ts",
        },
      },
      {
        extends: true,
        plugins: [mockModules(), storybookTest({ configDir: path.join(root, ".storybook") })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
