/**
 * MapLoadingIndicatorコンポーネント
 * Feature: 001-add-japan-map / User Story 1
 *
 * 地図データの読み込み中に表示されるローディングインジケーター
 */

import { Skeleton } from "@/components/ui/skeleton";

export function MapLoadingIndicator() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="地図を読み込んでいます"
      className="flex h-screen w-full flex-col items-center justify-center gap-4 p-8"
    >
      <div className="w-full max-w-4xl space-y-4">
        {/* メインの地図スケルトン */}
        <Skeleton data-testid="map-skeleton" className="h-96 w-full rounded-lg" />

        {/* コントロールパネルのスケルトン */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* ローディングメッセージ */}
      <p className="text-sm text-muted-foreground">地図を読み込んでいます...</p>
    </div>
  );
}
