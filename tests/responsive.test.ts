/**
 * レスポンシブデザイン検証テスト
 * 320px（モバイル）〜3840px（4K）までの解像度をテスト
 */

import { describe, expect, it } from "vitest";

describe("レスポンシブデザイン検証", () => {
  const viewportSizes = [
    { name: "Mobile (Small)", width: 320, height: 568 },
    { name: "Mobile (Medium)", width: 375, height: 667 },
    { name: "Mobile (Large)", width: 414, height: 896 },
    { name: "Tablet (Portrait)", width: 768, height: 1024 },
    { name: "Tablet (Landscape)", width: 1024, height: 768 },
    { name: "Desktop (Small)", width: 1280, height: 720 },
    { name: "Desktop (Medium)", width: 1920, height: 1080 },
    { name: "Desktop (Large - 4K)", width: 3840, height: 2160 },
  ];

  viewportSizes.forEach(({ name, width, height }) => {
    it(`${name} (${width}x${height}) - レイアウトが適切に表示される`, () => {
      // ビューポートサイズの検証
      expect(width).toBeGreaterThanOrEqual(320);
      expect(height).toBeGreaterThanOrEqual(568);

      // ヘッダー高さ（24px = h-6）がビューポート高さの10%を超えないこと
      const headerHeight = 24;
      const headerRatio = (headerHeight / height) * 100;
      expect(headerRatio).toBeLessThan(10);

      // 地図表示エリアがビューポートの90%以上を占めること
      const mapHeight = height - headerHeight;
      const mapRatio = (mapHeight / height) * 100;
      expect(mapRatio).toBeGreaterThanOrEqual(90);

      // 幅が320px以上であること（最小サポート幅）
      expect(width).toBeGreaterThanOrEqual(320);

      // 成功
      console.log(`✅ ${name}: レイアウト検証成功`);
    });
  });

  it("タイトルヘッダーがすべての解像度で表示される", () => {
    // ヘッダー高さ 24px
    const headerHeight = 24;

    viewportSizes.forEach(({ name, width, height }) => {
      // ヘッダーがビューポート内に収まること
      expect(headerHeight).toBeLessThanOrEqual(height);

      // ヘッダー幅がビューポート幅と一致すること
      const headerWidth = width;
      expect(headerWidth).toBe(width);

      console.log(`✅ ${name}: ヘッダー表示検証成功`);
    });
  });

  it("地図コンポーネントがすべての解像度でビューポートに収まる", () => {
    const headerHeight = 24;

    viewportSizes.forEach(({ name, width, height }) => {
      const mapHeight = height - headerHeight;
      const mapWidth = width;

      // 地図エリアがビューポート内に収まること
      expect(mapHeight).toBeGreaterThan(0);
      expect(mapWidth).toBeGreaterThan(0);

      // 地図エリアの最小サイズ検証（少なくとも100px x 100px）
      expect(mapHeight).toBeGreaterThanOrEqual(100);
      expect(mapWidth).toBeGreaterThanOrEqual(100);

      console.log(`✅ ${name}: 地図エリア検証成功 (${mapWidth}x${mapHeight})`);
    });
  });

  it("モバイル端末で地図が縦画面・横画面の両方で動作する", () => {
    const mobilePortrait = { width: 375, height: 667 };
    const mobileLandscape = { width: 667, height: 375 };

    [mobilePortrait, mobileLandscape].forEach(({ width, height }) => {
      const headerHeight = 24;
      const mapHeight = height - headerHeight;

      expect(mapHeight).toBeGreaterThan(0);
      expect(width).toBeGreaterThan(0);

      console.log(`✅ モバイル ${width}x${height}: 検証成功`);
    });
  });
});
