import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, "../src");

/**
 * ストーリーはブラウザで動くので、外部リソースを取りに行くモジュールは差し替える。
 * key は拡張子なしの絶対パス、value はモック実体（ESM の .js）。
 */
const moduleMocks: Record<string, string> = {
  // YouTube IFrame API を document.head に注入する。実 API を叩かせない
  [resolve(srcDir, "components/youtube-player")]: resolve(
    srcDir,
    "components/__mocks__/youtube-player.js",
  ),
  // TanStack Router の useSearch に依存する。ストーリー側で状態を作れるようにする
  [resolve(srcDir, "contexts/video-player-context")]: resolve(
    srcDir,
    "contexts/__mocks__/video-player-context.js",
  ),
};

/**
 * resolve.alias プラグインは enforce: "pre" のユーザープラグインより先に走るため、
 * `@/foo` は絶対パスに化けた状態でここへ届く。相対・エイリアス・絶対の
 * どれで書かれていても同じファイルなら捕まるよう正規化してから比較する。
 */
export function mockModules(): Plugin {
  return {
    name: "mock-modules",
    enforce: "pre",
    resolveId(source, importer) {
      const path = source.split("?")[0] ?? source;

      let target: string | null = null;
      if (path.startsWith("@/")) {
        target = resolve(srcDir, path.slice(2));
      } else if (isAbsolute(path)) {
        target = path;
      } else if (importer && path.startsWith(".")) {
        target = resolve(dirname(importer), path);
      }
      if (!target) return null;

      return moduleMocks[target.replace(/\.(m?[jt]sx?)$/, "")] ?? null;
    },
  };
}
