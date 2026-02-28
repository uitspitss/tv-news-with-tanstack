import { createFileRoute } from "@tanstack/react-router";
import { type ComponentType, useEffect, useState } from "react";
import type { JapanMapProps } from "@/components/japan-map";
import { MapErrorFallback } from "@/components/map-error-fallback";
import { MapLoadingIndicator } from "@/components/map-loading-indicator";

export const Route = createFileRoute("/")({
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
      <header className="fixed top-0 left-0 right-0 w-screen z-1000 h-10 flex items-center bg-[#1c1c1c] text-[#eaeaea] border-none will-change-transform">
        <h1 className="text-center w-full m-0 p-0 text-xl font-bold">tv-news</h1>
      </header>
      <main className="h-screen w-screen m-0 p-0">
        <div className="h-full w-full pt-8">
          {!MapComponent && showLoading && <MapLoadingIndicator />}
          {MapComponent && <MapComponent />}
        </div>
      </main>
    </>
  );
}
