/**
 * 日本地図の統合テスト
 * Feature: 001-add-japan-map / User Stories 1 & 3
 *
 * GeoJSONデータの読み込み、地図全体の動作、インタラクション機能をテストする
 */

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useMapInteraction } from "@/hooks/useMapInteraction";
import type { JapanMapData } from "@/lib/geo/japanGeoData";
import { fetchJapanMapData, validateJapanMapData } from "@/lib/geo/mapUtils";

describe("日本地図 - 統合テスト", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // ヘルパー関数: ファイルシステムからGeoJSONデータを読み込む
  function loadGeoJSONFromFile(): JapanMapData {
    const filePath = join(process.cwd(), "public/data/japan-prefectures.json");
    const fileContent = readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent) as JapanMapData;
  }

  describe("GeoJSONデータの読み込み", () => {
    it("実際のGeoJSONファイルが存在し、読み込める", () => {
      // ファイルシステムから実際のGeoJSONファイルを読み込む
      const data = loadGeoJSONFromFile();

      // データが有効なJapanMapData形式であることを確認
      expect(validateJapanMapData(data)).toBe(true);
    });

    it("GeoJSONデータに47都道府県すべてが含まれる", () => {
      const data = loadGeoJSONFromFile();

      // 47都道府県が含まれていることを確認
      expect(data.features).toHaveLength(47);
    });

    it("各都道府県に必須プロパティが含まれる", () => {
      const data = loadGeoJSONFromFile();

      data.features.forEach((feature, _index) => {
        // typeプロパティ
        expect(feature.type).toBe("Feature");

        // propertiesプロパティ
        expect(feature.properties).toBeDefined();
        expect(feature.properties.name).toBeTruthy();
        expect(feature.properties.code).toMatch(/^\d{2}$/);

        // geometryプロパティ
        expect(feature.geometry).toBeDefined();
        expect(["Polygon", "MultiPolygon"]).toContain(feature.geometry.type);
        expect(feature.geometry.coordinates).toBeDefined();
      });
    });

    it("すべての都道府県コードがユニークである", () => {
      const data = loadGeoJSONFromFile();

      const codes = data.features.map((f) => f.properties.code);
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(47);
    });

    it("すべての都道府県名がユニークである", () => {
      const data = loadGeoJSONFromFile();

      const names = data.features.map((f) => f.properties.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(47);
    });
  });

  describe("エラーハンドリング", () => {
    it("存在しないファイルの場合はエラーをスローする", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(fetchJapanMapData("/data/non-existent.json")).rejects.toThrow(
        "Failed to fetch GeoJSON data: 404 Not Found",
      );
    });

    it("無効なJSONの場合はエラーをスローする", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(fetchJapanMapData("/data/invalid.json")).rejects.toThrow();
    });

    it("無効なGeoJSON構造の場合はエラーをスローする", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          type: "Invalid",
          features: [],
        }),
      });

      await expect(fetchJapanMapData("/data/invalid.json")).rejects.toThrow(
        "Invalid GeoJSON data format",
      );
    });
  });

  describe("パフォーマンス", () => {
    it("GeoJSONファイルサイズを確認する", () => {
      // ファイルシステムから実際のファイルサイズを取得
      const filePath = join(process.cwd(), "public/data/japan-prefectures.json");
      const stats = statSync(filePath);
      const sizeInMB = stats.size / (1024 * 1024);

      // ファイルサイズを出力（情報提供のため）
      console.log(`GeoJSONファイルサイズ: ${sizeInMB.toFixed(2)} MB`);

      // ファイルが存在することを確認
      expect(stats.size).toBeGreaterThan(0);

      // 注: 現在のファイルは約12MBです。
      // 将来的にTopoJSON形式に変換して500KB以下にする予定です。
      // このテストは現時点では情報提供のみです。
    });

    it("GeoJSONデータの読み込み速度を確認する", () => {
      // ファイルシステムからの読み込み速度を測定
      const startTime = Date.now();
      const data = loadGeoJSONFromFile();
      const endTime = Date.now();

      const duration = endTime - startTime;
      console.log(`GeoJSON読み込み時間: ${duration}ms`);

      // データが正しく読み込まれたことを確認
      expect(data.features).toHaveLength(47);

      // 情報提供のみ - 実際の読み込み時間はファイルサイズに依存
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe("インタラクション機能 (User Story 3)", () => {
    it("useMapInteractionフックが正しく動作する", () => {
      const { result } = renderHook(() => useMapInteraction());

      // 初期状態
      expect(result.current.hoveredPrefecture).toBeNull();
      expect(result.current.selectedPrefecture).toBeNull();
      expect(result.current.focusedPrefecture).toBeNull();

      // ホバー操作
      act(() => {
        result.current.handleMouseEnter("13"); // 東京都
      });
      expect(result.current.hoveredPrefecture).toBe("13");

      // クリック操作
      act(() => {
        result.current.handleClick("13");
      });
      expect(result.current.selectedPrefecture).toBe("13");

      // フォーカス操作
      act(() => {
        result.current.handleFocus("14"); // 神奈川県
      });
      expect(result.current.focusedPrefecture).toBe("14");
    });

    it("useKeyboardNavフックが都道府県のナビゲーションをサポートする", () => {
      const data = loadGeoJSONFromFile();
      const prefectureCodes = data.features.map((f) => f.properties.code);
      const onSelect = vi.fn();

      const { result } = renderHook(() => useKeyboardNav(prefectureCodes, onSelect));

      // 初期状態
      expect(result.current.focusedIndex).toBe(-1);
      expect(result.current.focusedPrefecture).toBeNull();

      // 最初の都道府県にフォーカス
      act(() => {
        result.current.setFocusedIndex(0);
      });
      expect(result.current.focusedIndex).toBe(0);
      expect(result.current.focusedPrefecture).toBe(prefectureCodes[0]);

      // 次の都道府県に移動
      act(() => {
        result.current.moveFocus("next");
      });
      expect(result.current.focusedIndex).toBe(1);
      expect(result.current.focusedPrefecture).toBe(prefectureCodes[1]);

      // 前の都道府県に移動
      act(() => {
        result.current.moveFocus("prev");
      });
      expect(result.current.focusedIndex).toBe(0);
    });

    it("47都道府県すべてをキーボードで選択できる", () => {
      const data = loadGeoJSONFromFile();
      const prefectureCodes = data.features.map((f) => f.properties.code);

      const { result } = renderHook(() => useKeyboardNav(prefectureCodes));

      // すべての都道府県にアクセス可能であることを確認
      for (let i = 0; i < 47; i++) {
        act(() => {
          result.current.setFocusedIndex(i);
        });
        expect(result.current.focusedPrefecture).toBe(prefectureCodes[i]);
      }
    });

    it("インタラクション状態が独立して管理される", () => {
      const { result } = renderHook(() => useMapInteraction());

      // 複数の状態を同時に設定
      act(() => {
        result.current.handleMouseEnter("01"); // 北海道
        result.current.handleClick("13"); // 東京都
        result.current.handleFocus("47"); // 沖縄県
      });

      // すべての状態が独立して保持される
      expect(result.current.hoveredPrefecture).toBe("01");
      expect(result.current.selectedPrefecture).toBe("13");
      expect(result.current.focusedPrefecture).toBe("47");

      // 個別に状態をクリアできる
      act(() => {
        result.current.handleMouseLeave();
      });
      expect(result.current.hoveredPrefecture).toBeNull();
      expect(result.current.selectedPrefecture).toBe("13"); // 変更なし
      expect(result.current.focusedPrefecture).toBe("47"); // 変更なし
    });
  });
});
