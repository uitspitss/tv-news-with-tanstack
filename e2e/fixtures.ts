import { test as base, type Locator } from "@playwright/test";

/**
 * アプリ自身とは無関係な外部リソース。落ちていたり遅かったりすると
 * テストが不安定になるだけで、検証したいものは何も含まれていない。
 *
 * - YouTube IFrame API: プレイヤーの中身は E2E の対象外（パネルの開閉だけを見る）
 * - OpenFreeMap のタイル: 地図の見た目は Storybook 側の担当
 * - Google Fonts: 表示崩れはロケータに影響しない
 *
 * アプリのデータ（/data/*.json）はブロックしない。あれはサーバーが配る本物。
 */
const EXTERNAL_RESOURCES =
  /(youtube\.com|ytimg\.com|googlevideo\.com|tiles\.openfreemap\.org|fonts\.googleapis\.com|fonts\.gstatic\.com)/;

export const test = base.extend<{ blockExternalResources: RegExp }>({
  blockExternalResources: [
    async ({ page }, use) => {
      await page.route(EXTERNAL_RESOURCES, (route) => route.abort());
      await use(EXTERNAL_RESOURCES);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";

/** 地図上の局名ラベル。Leaflet の divIcon なので role を持たない */
export const broadcastLabel = (name: string) => `[data-broadcast-name="${name}"]`;

/**
 * 2つの要素の矩形が重なっているか。
 * Playwright に遮蔽を見る assertion が無いので手で判定する。
 * 呼ぶ前に両方が visible であることを assert してレイアウトを確定させること。
 */
export const overlaps = async (a: Locator, b: Locator) => {
  const [boxA, boxB] = await Promise.all([a.boundingBox(), b.boundingBox()]);
  if (!boxA || !boxB) throw new Error("要素の座標が取れない");

  return (
    boxA.x < boxB.x + boxB.width &&
    boxB.x < boxA.x + boxA.width &&
    boxA.y < boxB.y + boxB.height &&
    boxB.y < boxA.y + boxA.height
  );
};
