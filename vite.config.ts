import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
  },
  resolve:
    mode === "production"
      ? { alias: { "react-scan": "/dev/null" } }
      : undefined,
  plugins: [
    devtools(),
    tsConfigPaths(),
    tanstackStart(),
    // react's vite plugin must come after start's vite plugin
    viteReact({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
}));
