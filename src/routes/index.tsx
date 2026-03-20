import { createFileRoute } from "@tanstack/react-router";
import { type ComponentType, useEffect, useState } from "react";
import type { JapanMapProps } from "@/components/japan-map";
import { MapErrorFallback } from "@/components/map-error-fallback";
import { MapLoadingIndicator } from "@/components/map-loading-indicator";

export interface HomeSearchParams {
  broadcast?: string;
  index?: number;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearchParams => {
    const broadcast =
      typeof search.broadcast === "string" && search.broadcast.length > 0
        ? search.broadcast
        : undefined;
    const rawIndex =
      typeof search.index === "string" || typeof search.index === "number"
        ? Number(search.index)
        : undefined;
    const index =
      rawIndex !== undefined && !Number.isNaN(rawIndex) && rawIndex >= 0 ? rawIndex : undefined;
    return { broadcast, index };
  },
  component: Home,
  errorComponent: ({ error, reset }) => <MapErrorFallback error={error as Error} onRetry={reset} />,
});

export function Home() {
  const [MapComponent, setMapComponent] = useState<ComponentType<JapanMapProps> | null>(null);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // 200ms遅延後にローディング表示を有効化（短時間のローディングでちらつきを防ぐ）
    const loadingTimer = setTimeout(() => {
      if (!MapComponent) {
        setShowLoading(true);
      }
    }, 200);

    // クライアントサイドでのみ地図コンポーネントを動的インポート（SSR回避）
    import("@/components/japan-map").then((mod) => {
      setMapComponent(() => mod.JapanMap);
      setShowLoading(false); // ローディング完了
    });

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [MapComponent]);

  return (
    <>
      <header className="broadcast-header">
        <h1 className="broadcast-title">Japanese Local TV News</h1>
      </header>
      <main className="h-screen w-screen m-0 p-0">
        <div className="h-full w-full pt-[44px]">
          {!MapComponent && showLoading && <MapLoadingIndicator />}
          {MapComponent && <MapComponent />}
        </div>
      </main>
    </>
  );
}
