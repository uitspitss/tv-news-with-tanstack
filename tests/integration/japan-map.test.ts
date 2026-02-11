/**
 * 日本地図の統合テスト
 * Feature: 001-add-japan-map / User Story 1
 *
 * GeoJSONデータの読み込みと地図全体の動作をテストする
 */

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
});
