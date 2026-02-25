/**
 * JapanMapコンポーネント
 * Feature: 001-prefecture-office-button
 *
 * 日本地図上に都道府県庁舎所在地マーカーを表示するコンポーネント
 */

import { memo, useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { PrefectureOfficeMarkers } from "@/components/PrefectureOfficeMarkers";
import { useMapInteraction } from "@/hooks/useMapInteraction";
import "leaflet/dist/leaflet.css";

export interface JapanMapProps {
  /** 初期ズームレベル（デフォルト: 5） */
  initialZoom?: number;
  /** 初期中心座標（デフォルト: [138, 36] - 日本の中心） */
  initialCenter?: [number, number];
}

function JapanMapComponent({ initialZoom = 5, initialCenter = [138, 36] }: JapanMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Prefecture Office Markers用の状態とハンドラー
  const {
    selectedCapital,
    handleCapitalMouseEnter,
    handleCapitalMouseLeave,
    handleCapitalClick,
    handleCapitalFocus,
    handleCapitalBlur,
  } = useMapInteraction();

  // クライアントサイドでのみマウント（SSR hydration error回避）
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SSR中またはクライアントマウント前は何も表示しない
  if (!isMounted) {
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
        aria-label="日本の都道府県庁舎所在地地図"
      >
        {/* CartoDB Dark Matterタイルレイヤー（暗めの配色） */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* 都道府県庁舎所在地マーカー（Feature: 001-prefecture-office-button） */}
        <Prefectu
          reOfficeMarkers
          state={{ selectedCapital }}
          handlers={{
            handleCapitalMouseEnter,
            handleCapitalMouseLeave,
            handleCapitalClick,
            handleCapitalFocus,
            handleCapitalBlur,
          }}
        />
      </MapContainer>

      {/* Prefecture Office Markers スタイル */}
      <style>{`
        /* Prefecture Office Markers スタイル */
        .prefecture-office-marker {
          transition: transform 0.2s ease-in-out;
        }

        /* マーカーホバー効果 */
        .prefecture-office-marker:hover {
          transform: scale(1.2);
          z-index: 1000 !important;
        }

        /* マーカーフォーカス効果（WCAG 2.1 AA準拠） */
        .prefecture-office-marker:focus {
          outline: 3px solid #fbbf24;
          outline-offset: 2px;
        }

        .prefecture-office-marker:focus-visible {
          outline: 3px solid #fbbf24;
          outline-offset: 2px;
        }

        /* マーカー内の div 要素のスタイル */
        .prefecture-office-marker div {
          transition: all 0.2s ease-in-out;
        }

        .prefecture-office-marker:hover div {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4) !important;
        }
      `}</style>
    </div>
  );
}

// パフォーマンス最適化: メモ化して不要な再レンダリングを防止
export const JapanMap = memo(JapanMapComponent);
