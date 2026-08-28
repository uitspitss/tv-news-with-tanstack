import { test as base } from "@playwright/test";

/**
 * アプリ自身とは無関係な外部リソース。落ちていたり遅かったりすると
 * テストが不安定になるだけで、検証したいものは何も含まれていない。
 *
 * - YouTube IFrame API: プレイヤーの中身は E2E の対象外（パネルの開閉だけを見る）
 * - Esri のタイル: 地図の見た目は Storybook 側の担当
 * - Google Fonts: 表示崩れはロケータに影響しない
 *
 * アプリのデータ（/data/*.json）はブロックしない。あれはサーバーが配る本物。
 */
const EXTERNAL_RESOURCES =
  /(youtube\.com|ytimg\.com|googlevideo\.com|server\.arcgisonline\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)/;

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
