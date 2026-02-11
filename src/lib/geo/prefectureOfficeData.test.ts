/**
 * Prefecture Office Data Validation Tests
 */

import { describe, it, expect } from "vitest";
import {
  validatePrefectureOffice,
  validatePrefectureOfficeData,
  type PrefectureOffice,
} from "./prefectureOfficeData";

describe("validatePrefectureOffice", () => {
  it("should validate a correct prefecture office object", () => {
    const validOffice: PrefectureOffice = {
      code: "01",
      name: "北海道",
      officeName: "北海道庁",
      lat: 43.064301,
      lon: 141.346874,
    };

    expect(validatePrefectureOffice(validOffice)).toBe(true);
  });

  it("should reject invalid prefecture code (non-string)", () => {
    const invalidOffice = {
      code: 1, // 数値（無効）
      name: "北海道",
      officeName: "北海道庁",
      lat: 43.064301,
      lon: 141.346874,
    };

    expect(validatePrefectureOffice(invalidOffice)).toBe(false);
  });

  it("should reject invalid prefecture code (out of range)", () => {
    const invalidOffice = {
      code: "99", // 範囲外（48以上）
      name: "北海道",
      officeName: "北海道庁",
      lat: 43.064301,
      lon: 141.346874,
    };

    expect(validatePrefectureOffice(invalidOffice)).toBe(false);
  });

  it("should reject invalid prefecture code (wrong format)", () => {
    const invalidOffice = {
      code: "1", // ゼロパディングなし
      name: "北海道",
      officeName: "北海道庁",
      lat: 43.064301,
      lon: 141.346874,
    };

    expect(validatePrefectureOffice(invalidOffice)).toBe(false);
  });

  it("should reject empty prefecture name", () => {
    const invalidOffice = {
      code: "01",
      name: "", // 空文字列
      officeName: "北海道庁",
      lat: 43.064301,
      lon: 141.346874,
    };

    expect(validatePrefectureOffice(invalidOffice)).toBe(false);
  });

  it("should reject empty office name", () => {
    const invalidOffice = {
      code: "01",
      name: "北海道",
      officeName: "", // 空文字列
      lat: 43.064301,
      lon: 141.346874,
    };

    expect(validatePrefectureOffice(invalidOffice)).toBe(false);
  });

  it("should reject invalid latitude (out of range)", () => {
    const invalidOffice = {
      code: "01",
      name: "北海道",
      officeName: "北海道庁",
      lat: 95.0, // 範囲外（>90）
      lon: 141.346874,
    };

    expect(validatePrefectureOffice(invalidOffice)).toBe(false);
  });

  it("should reject invalid longitude (out of range)", () => {
    const invalidOffice = {
      code: "01",
      name: "北海道",
      officeName: "北海道庁",
      lat: 43.064301,
      lon: 185.0, // 範囲外（>180）
    };

    expect(validatePrefectureOffice(invalidOffice)).toBe(false);
  });

  it("should reject null input", () => {
    expect(validatePrefectureOffice(null)).toBe(false);
  });

  it("should reject undefined input", () => {
    expect(validatePrefectureOffice(undefined)).toBe(false);
  });

  it("should reject non-object input", () => {
    expect(validatePrefectureOffice("not an object")).toBe(false);
    expect(validatePrefectureOffice(123)).toBe(false);
    expect(validatePrefectureOffice(true)).toBe(false);
  });
});

describe("validatePrefectureOfficeData", () => {
  it("should validate correct array of 47 prefecture offices", () => {
    const validData: PrefectureOffice[] = Array.from({ length: 47 }, (_, i) => ({
      code: String(i + 1).padStart(2, "0"),
      name: `都道府県${i + 1}`,
      officeName: `都道府県${i + 1}庁`,
      lat: 35.0 + i * 0.1,
      lon: 135.0 + i * 0.1,
    }));

    expect(validatePrefectureOfficeData(validData)).toBe(true);
  });

  it("should reject non-array input", () => {
    expect(validatePrefectureOfficeData("not an array")).toBe(false);
    expect(validatePrefectureOfficeData({})).toBe(false);
    expect(validatePrefectureOfficeData(null)).toBe(false);
  });

  it("should reject array with incorrect length (less than 47)", () => {
    const invalidData: PrefectureOffice[] = Array.from({ length: 46 }, (_, i) => ({
      code: String(i + 1).padStart(2, "0"),
      name: `都道府県${i + 1}`,
      officeName: `都道府県${i + 1}庁`,
      lat: 35.0,
      lon: 135.0,
    }));

    expect(validatePrefectureOfficeData(invalidData)).toBe(false);
  });

  it("should reject array with incorrect length (more than 47)", () => {
    const invalidData: PrefectureOffice[] = Array.from({ length: 48 }, (_, i) => ({
      code: String(i + 1).padStart(2, "0"),
      name: `都道府県${i + 1}`,
      officeName: `都道府県${i + 1}庁`,
      lat: 35.0,
      lon: 135.0,
    }));

    expect(validatePrefectureOfficeData(invalidData)).toBe(false);
  });

  it("should reject array with invalid items", () => {
    const invalidData = Array.from({ length: 47 }, (_, i) => ({
      code: String(i + 1).padStart(2, "0"),
      name: i === 10 ? "" : `都道府県${i + 1}`, // 11番目が無効
      officeName: `都道府県${i + 1}庁`,
      lat: 35.0,
      lon: 135.0,
    }));

    expect(validatePrefectureOfficeData(invalidData)).toBe(false);
  });
});
