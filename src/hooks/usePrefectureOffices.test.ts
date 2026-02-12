/**
 * usePrefectureOffices Hook Tests
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrefectureOffices } from "./usePrefectureOffices";
import type { PrefectureOffice } from "@/lib/geo/prefectureOfficeData";

// グローバルfetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// モックデータ
const mockPrefectureOffices: PrefectureOffice[] = Array.from({ length: 47 }, (_, i) => ({
  code: String(i + 1).padStart(2, "0"),
  name: `都道府県${i + 1}`,
  officeName: `都道府県${i + 1}庁`,
  lat: 35.0 + i * 0.1,
  lon: 135.0 + i * 0.1,
}));

describe("usePrefectureOffices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and return prefecture office data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrefectureOffices,
    });

    const { result } = renderHook(() => usePrefectureOffices());

    // 初期状態: ローディング中
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // データ取得完了を待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // データが正しく取得されたことを確認
    expect(result.current.data).toEqual(mockPrefectureOffices);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith("/data/prefecture-offices.json");
  });

  it("should handle fetch error and auto-retry once", async () => {
    // 1回目: エラー
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    // 2回目（自動リトライ）: 成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrefectureOffices,
    });

    const { result } = renderHook(() => usePrefectureOffices());

    // 初期状態
    expect(result.current.isLoading).toBe(true);

    // 1回目のエラー後、自動リトライが実行され、成功することを待つ（最大3秒）
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockPrefectureOffices);
      },
      { timeout: 3000 },
    );

    // 最終的にデータが取得されたことを確認
    expect(result.current.data).toEqual(mockPrefectureOffices);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should set error after auto-retry fails", async () => {
    const errorMessage = "Network error";
    // 1回目: エラー
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));
    // 2回目（自動リトライ）: エラー
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { result } = renderHook(() => usePrefectureOffices());

    // 1回目のエラー + 自動リトライ失敗を待つ（最大3秒）
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
      },
      { timeout: 3000 },
    );

    expect(result.current.data).toBeNull();
    expect(result.current.error?.message).toBe(errorMessage);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should handle invalid data format", async () => {
    const invalidData = [{ invalid: "data" }];
    // 1回目: 無効なデータ
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => invalidData,
    });
    // 2回目（auto-retry）: 同じ無効なデータ
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => invalidData,
    });

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { result } = renderHook(() => usePrefectureOffices());

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 },
    );

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("Invalid prefecture office data");

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should handle manual retry", async () => {
    // 1回目: エラー
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    // 2回目（auto-retry）: エラー
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    // 3回目（手動リトライ）: 成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrefectureOffices,
    });

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { result } = renderHook(() => usePrefectureOffices());

    // 自動リトライ失敗を待つ（最大3秒）
    await waitFor(
      () => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 },
    );

    // 手動リトライを実行
    result.current.retry();

    // 手動リトライ成功を待つ（長めのタイムアウト）
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockPrefectureOffices);
        expect(result.current.error).toBeNull();
      },
      { timeout: 5000 },
    );

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should warn about incomplete data", async () => {
    const incompleteData = mockPrefectureOffices.slice(0, 46); // 46件のみ
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => incompleteData,
    });

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => usePrefectureOffices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // データ検証エラーになる（47件未満）
    expect(result.current.error).toBeInstanceOf(Error);

    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
