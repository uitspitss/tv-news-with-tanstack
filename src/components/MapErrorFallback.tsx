/**
 * MapErrorFallbackコンポーネント
 * Feature: 001-add-japan-map / User Story 1
 *
 * 地図データの読み込みエラー時に表示されるエラーUI
 */

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export interface MapErrorFallbackProps {
  /** エラーオブジェクト */
  error: Error;
  /** 再試行ハンドラー */
  onRetry?: () => void;
  /** エラーの詳細を表示するか（デフォルト: 開発環境のみ） */
  showDetails?: boolean;
}

export function MapErrorFallback({
  error,
  onRetry,
  showDetails = import.meta.env.DEV,
}: MapErrorFallbackProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>地図データの読み込みに失敗しました</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              申し訳ございません。地図データを読み込めませんでした。ネットワーク接続を確認して、再度お試しください。
            </p>

            {showDetails && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">エラーの詳細</summary>
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                  {error.message}
                </pre>
              </details>
            )}

            {onRetry && (
              <div className="mt-4">
                <Button onClick={onRetry} variant="outline" size="sm">
                  再試行
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
