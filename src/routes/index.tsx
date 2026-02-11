import { createFileRoute } from "@tanstack/react-router";
import { type ComponentType, useEffect, useState } from "react";
import type { JapanMapProps } from "@/components/JapanMap";
import { MapErrorFallback } from "@/components/MapErrorFallback";
import { MapLoadingIndicator } from "@/components/MapLoadingIndicator";

export const Route = createFileRoute("/")({
  component: Home,
  errorComponent: ({ error, reset }) => <MapErrorFallback error={error as Error} onRetry={reset} />,
});

function Home() {
  const [MapComponent, setMapComponent] = useState<ComponentType<JapanMapProps> | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ地図コンポーネントを動的インポート（SSR回避）
    import("@/components/JapanMap").then((mod) => {
      setMapComponent(() => mod.JapanMap);
    });
  }, []);

  return (
    <main className="relative h-screen w-full">
      {!MapComponent ? <MapLoadingIndicator /> : <MapComponent />}
    </main>
  );
}
