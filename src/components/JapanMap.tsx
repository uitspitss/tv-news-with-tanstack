import { memo, useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { PrefectureOfficeMarkers } from "@/components/PrefectureOfficeMarkers";
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
      <MapContainer
        center={[initialCenter[1], initialCenter[0]]}
        zoom={initialZoom}
        minZoom={5}
        maxZoom={10}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        aria-label="日本のTV局放送エリア地図"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <PrefectureOfficeMarkers />
      </MapContainer>

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
          font-size: 9px;
          font-weight: 600;
          line-height: 13px;
          color: #ffffff;
          background-color: rgba(0, 0, 0, 0.65);
          padding: 0 3px;
          white-space: nowrap;
          border-radius: 2px;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}

export const JapanMap = memo(JapanMapComponent);
