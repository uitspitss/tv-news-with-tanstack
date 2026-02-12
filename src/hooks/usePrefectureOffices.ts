/**
 * Prefecture Offices Data Fetching Hook
 *
 * Custom hook for fetching and managing prefecture office location data.
 */

import { useCallback, useEffect, useState } from "react";
import type { PrefectureOffice, PrefectureOfficeData } from "@/lib/geo/prefectureOfficeData";
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
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // リトライカウンターはローカル変数として管理
    let currentRetryCount = 0;

    const attemptFetch = async (): Promise<void> => {
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
            "VALIDATION_ERROR: Invalid prefecture office data format or incomplete data (expected 47 prefectures)",
          );
        }

        // データ欠落のチェック（改善版 - すべての期待されるコードが存在するかチェック）
        const existingCodes = new Set(json.map((office: PrefectureOffice) => office.code));
        for (let i = 1; i <= 47; i++) {
          const expectedCode = String(i).padStart(2, "0");
          if (!existingCodes.has(expectedCode)) {
            console.warn(`⚠️ Missing prefecture code: ${expectedCode}`);
          }
        }

        setData(json);
        setIsLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error occurred");
        console.error("❌ Failed to load prefecture office data:", error);

        // データ検証エラーの場合はリトライしない（一時的なエラーではないため）
        const isValidationError = error.message.startsWith("VALIDATION_ERROR:");
        const shouldRetry = currentRetryCount === 0 && !isValidationError;

        if (shouldRetry) {
          console.log("🔄 Auto-retrying once...");
          currentRetryCount = 1;
          // 少し待ってから再試行
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await attemptFetch();
          return;
        }

        // リトライしない、またはリトライ失敗時はエラーを設定
        setError(error);
        setIsLoading(false);
      }
    };

    await attemptFetch();
  }, []); // 依存配列を空にして無限ループを回避

  // 手動リトライ関数
  const retry = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  // データ取得（コンポーネントマウント時 + 手動リトライ時）
  useEffect(() => {
    fetchData();
  }, [fetchData, refetchTrigger]);

  return {
    data,
    isLoading,
    error,
    retry,
  };
}
