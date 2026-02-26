import { createFileRoute } from "@tanstack/react-router";
import { type ComponentType, useEffect, useState } from "react";
import type { JapanMapProps } from "@/components/JapanMap";
import { MapErrorFallback } from "@/components/MapErrorFallback";
import { MapLoadingIndicator } from "@/components/MapLoadingIndicator";

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
    import("@/components/JapanMap").then((mod) => {
      setMapComponent(() => mod.JapanMap);
      setShowLoading(false); // ローディング完了
    });

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [MapComponent]);

  return (
    <>
      <header
        className="border-b will-change-transform"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100vw",
          zIndex: 1000,
          height: "40px",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#1c1c1c",
          color: "#eaeaea",
          border: "none",
        }}
      >
        <h1
          className="text-sm font-bold leading-none"
          style={{ textAlign: "center", width: "100%", margin: 0, padding: 0 }}
        >
          tv-news
        </h1>
      </header>
      <main className="h-screen w-screen m-0 p-0">
        <div className="h-full w-full" style={{ paddingTop: "32px" }}>
          {!MapComponent && showLoading && <MapLoadingIndicator />}
          {MapComponent && <MapComponent />}
        </div>
      </main>
    </>
  );
}
