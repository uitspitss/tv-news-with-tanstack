import { memo, useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
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
    <div className="h-screen w-full" aria-label="日本地図" role="application">
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
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <PrefectureOfficeMarkers />
        </MapContainer>
        <VideoPlayerPanel />
      </VideoPlayerProvider>

      <style>{`
        .broadcast-label-marker {
          background: transparent !important;
          border: none !important;
        }

        .broadcast-label-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
        }

        .broadcast-name {
          font-size: 11px;
          font-weight: 600;
          line-height: 16px;
          color: #ffffff;
          background-color: rgba(0, 0, 0, 0.65);
          padding: 0 3px;
          white-space: nowrap;
          border-radius: 2px;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .broadcast-name:hover {
          background-color: rgba(80, 80, 220, 0.8);
        }

        .broadcast-name--active {
          background-color: rgba(220, 50, 50, 0.85);
          color: #fff;
          box-shadow: 0 0 8px rgba(220, 50, 50, 0.5);
          animation: active-pulse 2s ease-in-out infinite;
        }

        .broadcast-name--active:hover {
          background-color: rgba(220, 50, 50, 0.95);
        }

        @keyframes active-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(220, 50, 50, 0.5); }
          50% { box-shadow: 0 0 14px rgba(220, 50, 50, 0.8); }
        }
      `}</style>
    </div>
  );
}

export const JapanMap = memo(JapanMapComponent);
