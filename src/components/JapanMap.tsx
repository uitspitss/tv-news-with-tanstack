/**
 * JapanMapコンポーネント
 * Feature: 001-add-japan-map / User Story 1
 *
 * 日本の都道府県地図を表示するメインコンポーネント
 */

import { memo, useEffect, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { JapanMapData } from "@/lib/geo/japanGeoData";
import { fetchJapanMapData } from "@/lib/geo/mapUtils";
import "leaflet/dist/leaflet.css";

export interface JapanMapProps {
  /** 初期ズームレベル（デフォルト: 5） */
  initialZoom?: number;
  /** 初期中心座標（デフォルト: [138, 36] - 日本の中心） */
  initialCenter?: [number, number];
  /** 都道府県クリック時のコールバック */
  onPrefectureClick?: (prefectureCode: string) => void;
}

function JapanMapComponent({
  initialZoom = 5,
  initialCenter = [138, 36],
  onPrefectureClick,
}: JapanMapProps) {
  const [mapData, setMapData] = useState<JapanMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // クライアントサイドでのみマウント（SSR hydration error回避）
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // GeoJSONデータを読み込む
  useEffect(() => {
    if (!isMounted) return; // クライアントサイドでのみ実行

    let cancelled = false;

    async function loadMapData() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchJapanMapData("/data/japan-prefectures.json");

        if (!cancelled) {
          setMapData(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error occurred"));
          setIsLoading(false);
        }
      }
    }

    loadMapData();

    return () => {
      cancelled = true;
    };
  }, [isMounted]);

  if (error) {
    throw error; // Error Boundaryでキャッチされる
  }

  // SSR中またはクライアントマウント前は何も表示しない
  if (!isMounted || isLoading || !mapData) {
    return null;
  }

  // 地図のレンダリング（クライアントサイドのみ）
  return (
    <div className="h-screen w-full" aria-label="日本地図" role="application">
      <MapContainer
        center={[initialCenter[1], initialCenter[0]]} // Leafletは[lat, lng]の順序
        zoom={initialZoom}
        minZoom={5}
        maxZoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        aria-label="日本の都道府県地図"
      >
        {/* OpenStreetMapタイルレイヤー */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* GeoJSONレイヤー - 47都道府県すべてを表示 */}
        <GeoJSON
          data={mapData}
          style={() => ({
            fillColor: "#3388ff",
            weight: 2,
            opacity: 1,
            color: "white",
            fillOpacity: 0.7,
          })}
        />
      </MapContainer>
    </div>
  );
}

// パフォーマンス最適化: メモ化して不要な再レンダリングを防止
export const JapanMap = memo(JapanMapComponent);
