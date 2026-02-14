/**
 * Prefecture Offices Data Fetching Hook
 *
 * Custom hook for fetching and managing prefecture office location data.
 */

import { useCallback, useEffect, useState } from "react";
import type { PrefectureOfficeData } from "@/lib/geo/prefectureOfficeData";
import { validatePrefectureOfficeData } from "@/lib/geo/prefectureOfficeData";

interface UsePrefectureOfficesReturn {
  /** 庁舎所在地データ */
  data: PrefectureOfficeData | null;
  /** ローディング中かどうか */
  isLoading: boolean;
  /** エラー */
  error: Error | null;
  /** リトライ関数 */
  retry: () => void;
}

/**
 * 都道府県庁舎所在地データを取得するカスタムフック
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, retry } = usePrefectureOffices();
 *
 * if (isLoading) return <LoadingIndicator />;
 * if (error) return <ErrorMessage error={error} onRetry={retry} />;
 * if (!data) return null;
 *
 * return <PrefectureOfficeMarkers data={data} />;
 * ```
 */
export function usePrefectureOffices(): UsePrefectureOfficesReturn {
  const [data, setData] = useState<PrefectureOfficeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/data/prefecture-offices.json");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch prefecture office data: ${response.status} ${response.statusText}`,
        );
      }

      const json = await response.json();

      // データ検証
      if (!validatePrefectureOfficeData(json)) {
        throw new Error(
          "Invalid prefecture office data format or incomplete data (expected 47 prefectures)",
        );
      }

      // データ欠落のチェック（ログに警告を出力）
      if (json.length < 47) {
        console.warn(`⚠️ Prefecture office data is incomplete: ${json.length}/47 prefectures`);
        json.forEach((office, index) => {
          const expectedCode = String(index + 1).padStart(2, "0");
          if (office.code !== expectedCode) {
            console.warn(
              `⚠️ Missing or incorrect prefecture code at index ${index}: expected ${expectedCode}, got ${office.code}`,
            );
          }
        });
      }

      setData(json);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");
      console.error("❌ Failed to load prefecture office data:", error);

      // 自動リトライ（1回のみ）
      if (retryCount === 0) {
        console.log("🔄 Auto-retrying once...");
        setRetryCount(1);
        // 少し待ってから再試行
        setTimeout(() => {
          fetchData();
        }, 1000);
        return;
      }

      // リトライ失敗時はエラーを設定
      setError(error);
      setIsLoading(false);
    }
  }, [retryCount]);

  // 手動リトライ関数
  const retry = useCallback(() => {
    setRetryCount(0);
  }, []);

  // データ取得（コンポーネントマウント時 + 手動リトライ時）
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    retry,
  };
}
