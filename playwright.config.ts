import { defineConfig, devices } from "@playwright/test";

// 開発サーバー(3000)とずらす。ずらさないと `bun dev` を上げたままテストを回したとき
// 開発サーバーに対して走ってしまい、本番ビルドを検証した意味が消える
const PORT = process.env.E2E_PORT ?? "3100";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  // Vitest の include（{src,tests}/**）と食い合わないよう E2E は e2e/ に隔離する
  testDir: "./e2e",

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    // vite dev ではなく本番ビルドを配る。dev のオンデマンドコンパイル待ちは
    // タイムアウトではなく「要素が見つからない」として現れて原因が分からなくなる
    command: `bun run build && bun run serve --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // 既定の "ignore" だとサーバー側のエラーが握り潰される
    stdout: "pipe",
  },
});
