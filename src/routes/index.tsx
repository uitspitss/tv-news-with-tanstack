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

  useEffect(() => {
    // クライアントサイドでのみ地図コンポーネントを動的インポート（SSR回避）
    import("@/components/JapanMap").then((mod) => {
      setMapComponent(() => mod.JapanMap);
    });
  }, []);

  return (
    <>
      <header className="fixed top-0 z-10 w-full bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-2xl font-bold">tv-news</h1>
      </header>
      <main className="relative h-screen w-full">
        {!MapComponent ? <MapLoadingIndicator /> : <MapComponent />}
      </main>
    </>
  );
}
