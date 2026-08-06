import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
// Storybook の main.ts では拡張子ありの相対 import が必要
import { mockModules } from "./mock-modules.ts";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, "../src");

/**
 * 依存の遅延最適化はテスト中のページリロードを招き、走っていたストーリーを落とす。
 * vitest.config.ts からも参照するので、ここを唯一の定義にする。
 */
export const optimizeDepsInclude = [
  "react",
  "react-dom/client",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

const config: StorybookConfig = {
  // ストーリーは対象と同じ場所に置く（src/components/foo.stories.tsx）
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-vitest", "@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/react-vite",

  viteFinal(vite) {
    // vitest から走る storybook プロジェクトはこの設定を読まないので、
    // 同じ alias / optimizeDeps / mockModules を vitest.config.ts 側にも置いてある
    vite.plugins ??= [];
    vite.plugins.push(mockModules());

    vite.resolve ??= {};
    vite.resolve.alias = Array.isArray(vite.resolve.alias)
      ? [...vite.resolve.alias, { find: "@", replacement: srcDir }]
      : { ...vite.resolve.alias, "@": srcDir };

    vite.optimizeDeps ??= {};
    vite.optimizeDeps.include = [...(vite.optimizeDeps.include ?? []), ...optimizeDepsInclude];

    return vite;
  },
};

export default config;
