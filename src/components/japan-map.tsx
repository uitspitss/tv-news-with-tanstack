import { memo, useEffect, useState } from "react";
import { AttributionControl, MapContainer } from "react-leaflet";
import { BaseMapLayer } from "@/components/base-map-layer";
import { BroadcastFontSizeController } from "@/components/broadcast-font-size-controller";
import { PrefectureOfficeMarkers } from "@/components/prefecture-office-markers";
import { VideoPlayerPanel } from "@/components/video-player-panel";
import { VideoPlayerProvider } from "@/contexts/video-player-context";
import "leaflet/dist/leaflet.css";

export interface JapanMapProps {
  initialZoom?: number;
  initialCenter?: [number, number];
}

function JapanMapComponent({ initialZoom = 5, initialCenter = [138, 36] }: JapanMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    // h-screen だと親の pt-[44px] と合わせて 100vh + 44px になり、
    // 地図の下端（＝帰属表示）が画面外に押し出される
    <div className="h-full w-full" aria-label="日本地図" role="application">
      <VideoPlayerProvider>
        <MapContainer
          center={[initialCenter[1], initialCenter[0]]}
          zoom={initialZoom}
          minZoom={5}
          maxZoom={10}
          zoomControl={false}
          scrollWheelZoom={true}
          className="h-full w-full"
          aria-label="日本のTV局放送エリア地図"
          // 既定の bottomright はプレイヤーパネルに隠れる。
          // OpenFreeMap / OpenStreetMap は帰属表示が必須なので左下へ逃がす
          attributionControl={false}
        >
          <AttributionControl position="bottomleft" />
          <BaseMapLayer />
          <BroadcastFontSizeController />
          <PrefectureOfficeMarkers />
        </MapContainer>
        <VideoPlayerPanel />
      </VideoPlayerProvider>
    </div>
  );
}

export const JapanMap = memo(JapanMapComponent);
