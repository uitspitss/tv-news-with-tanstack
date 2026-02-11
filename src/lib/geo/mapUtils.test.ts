/**
 * 地図ユーティリティ関数のテスト
 * Feature: 001-add-japan-map
 */

import { describe, expect, it, vi } from "vitest";
import type { JapanMapData, Prefecture } from "./japanGeoData";
import {
  fetchJapanMapData,
  findPrefectureByCode,
  findPrefectureByName,
  validateJapanMapData,
  validatePrefecture,
} from "./mapUtils";

// モックデータ
const mockPrefecture: Prefecture = {
  type: "Feature",
  properties: {
    name: "東京都",
    code: "13",
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [139.0, 35.0],
        [139.5, 35.0],
        [139.5, 35.5],
        [139.0, 35.5],
        [139.0, 35.0],
      ],
    ],
  },
};

const mockJapanMapData: JapanMapData = {
  type: "FeatureCollection",
  features: [
    mockPrefecture,
    {
      type: "Feature",
      properties: {
        name: "神奈川県",
        code: "14",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [139.0, 35.0],
            [139.5, 35.0],
            [139.5, 34.5],
            [139.0, 34.5],
            [139.0, 35.0],
          ],
        ],
      },
    },
  ],
};

describe("validatePrefecture", () => {
  it("有効な都道府県データを検証する", () => {
    expect(validatePrefecture(mockPrefecture)).toBe(true);
  });

  it("nullを拒否する", () => {
    expect(validatePrefecture(null)).toBe(false);
  });

  it("undefinedを拒否する", () => {
    expect(validatePrefecture(undefined)).toBe(false);
  });

  it('type が "Feature" でない場合は拒否する', () => {
    const invalid = { ...mockPrefecture, type: "Invalid" };
    expect(validatePrefecture(invalid)).toBe(false);
  });

  it("properties.name が欠けている場合は拒否する", () => {
    const invalid = {
      ...mockPrefecture,
      properties: { code: "13" },
    };
    expect(validatePrefecture(invalid)).toBe(false);
  });

  it("properties.code が欠けている場合は拒否する", () => {
    const invalid = {
      ...mockPrefecture,
      properties: { name: "東京都" },
    };
    expect(validatePrefecture(invalid)).toBe(false);
  });

  it("properties.code が2桁でない場合は拒否する", () => {
    const invalid = {
      ...mockPrefecture,
      properties: { name: "東京都", code: "1" },
    };
    expect(validatePrefecture(invalid)).toBe(false);
  });

  it("geometry.type が Polygon または MultiPolygon でない場合は拒否する", () => {
    const invalid = {
      ...mockPrefecture,
      geometry: { type: "Point", coordinates: [139.0, 35.0] },
    };
    expect(validatePrefecture(invalid)).toBe(false);
  });

  it("MultiPolygon 型のジオメトリを検証する", () => {
    const multiPolygon: Prefecture = {
      type: "Feature",
      properties: {
        name: "北海道",
        code: "01",
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [145.0, 43.0],
              [145.5, 43.0],
              [145.5, 43.5],
              [145.0, 43.5],
              [145.0, 43.0],
            ],
          ],
        ],
      },
    };
    expect(validatePrefecture(multiPolygon)).toBe(true);
  });
});

describe("validateJapanMapData", () => {
  it("有効な日本地図データを検証する", () => {
    // 47都道府県の完全なデータではないので、警告が出るが true を返す
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(validateJapanMapData(mockJapanMapData)).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith("Expected 47 prefectures, got 2");
    consoleSpy.mockRestore();
  });

  it("47都道府県の完全なデータを検証する", () => {
    const fullData: JapanMapData = {
      type: "FeatureCollection",
      features: Array.from({ length: 47 }, (_, i) => ({
        type: "Feature" as const,
        properties: {
          name: `都道府県${i + 1}`,
          code: (i + 1).toString().padStart(2, "0"),
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [139.0, 35.0],
              [139.5, 35.0],
              [139.5, 35.5],
              [139.0, 35.5],
              [139.0, 35.0],
            ],
          ],
        },
      })),
    };
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(validateJapanMapData(fullData)).toBe(true);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("nullを拒否する", () => {
    expect(validateJapanMapData(null)).toBe(false);
  });

  it("undefinedを拒否する", () => {
    expect(validateJapanMapData(undefined)).toBe(false);
  });

  it('type が "FeatureCollection" でない場合は拒否する', () => {
    const invalid = { ...mockJapanMapData, type: "Invalid" };
    expect(validateJapanMapData(invalid)).toBe(false);
  });

  it("features が配列でない場合は拒否する", () => {
    const invalid = { type: "FeatureCollection", features: "not an array" };
    expect(validateJapanMapData(invalid)).toBe(false);
  });

  it("無効な都道府県が含まれる場合は拒否する", () => {
    const invalid: JapanMapData = {
      type: "FeatureCollection",
      features: [mockPrefecture, { type: "Invalid" } as any],
    };
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(validateJapanMapData(invalid)).toBe(false);
    consoleSpy.mockRestore();
  });
});

describe("findPrefectureByCode", () => {
  it("都道府県コードで検索できる", () => {
    const result = findPrefectureByCode(mockJapanMapData, "13");
    expect(result).toEqual(mockPrefecture);
  });

  it("存在しないコードの場合は undefined を返す", () => {
    const result = findPrefectureByCode(mockJapanMapData, "99");
    expect(result).toBeUndefined();
  });
});

describe("findPrefectureByName", () => {
  it("都道府県名で検索できる", () => {
    const result = findPrefectureByName(mockJapanMapData, "東京都");
    expect(result).toEqual(mockPrefecture);
  });

  it("存在しない名前の場合は undefined を返す", () => {
    const result = findPrefectureByName(mockJapanMapData, "存在しない都道府県");
    expect(result).toBeUndefined();
  });
});

describe("fetchJapanMapData", () => {
  it("GeoJSONデータを取得できる", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJapanMapData,
    });

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await fetchJapanMapData("/data/japan-prefectures.json");
    expect(result).toEqual(mockJapanMapData);
    consoleSpy.mockRestore();
  });

  it("ネットワークエラーの場合はエラーをスローする", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(fetchJapanMapData("/data/japan-prefectures.json")).rejects.toThrow(
      "Failed to fetch GeoJSON data: 404 Not Found",
    );
  });

  it("無効なGeoJSONの場合はエラーをスローする", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ type: "Invalid" }),
    });

    await expect(fetchJapanMapData("/data/japan-prefectures.json")).rejects.toThrow(
      "Invalid GeoJSON data format",
    );
  });
});
