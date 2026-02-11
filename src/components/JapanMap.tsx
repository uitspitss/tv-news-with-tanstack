/**
 * JapanMapコンポーネント
 * Feature: 001-add-japan-map / User Stories 1 & 3
 *
 * 日本の都道府県地図を表示するメインコンポーネント
 * インタラクション機能（ホバー、クリック、キーボードナビゲーション）をサポート
 */

import type { Layer, Path } from "leaflet";
import { memo, useCallback, useEffect, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import { PrefectureOfficeMarkers } from "@/components/PrefectureOfficeMarkers";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useMapInteraction } from "@/hooks/useMapInteraction";
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
  /** 都道府県ホバー時のコールバック */
  onPrefectureHover?: (prefectureCode: string | null) => void;
}

function JapanMapComponent({
  initialZoom = 5,
  initialCenter = [138, 36],
  onPrefectureClick,
  onPrefectureHover,
}: JapanMapProps) {
  const [mapData, setMapData] = useState<JapanMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // インタラクション状態管理（User Story 3 + Prefecture Office Markers）
  const {
    hoveredPrefecture,
    selectedPrefecture,
    focusedPrefecture,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleFocus,
    handleBlur,
    // Prefecture Office Markers用の状態とハンドラー
    selectedCapital,
    handleCapitalMouseEnter,
    handleCapitalMouseLeave,
    handleCapitalClick,
    handleCapitalFocus,
    handleCapitalBlur,
  } = useMapInteraction();

  // 都道府県コードの配列を取得（キーボードナビゲーション用）
  const prefectureCodes = mapData?.features.map((f) => f.properties.code) ?? [];

  // キーボードナビゲーション（User Story 3）
  const { handleKeyDown } = useKeyboardNav(prefectureCodes, (prefectureCode) => {
    handleClick(prefectureCode);
    onPrefectureClick?.(prefectureCode);
  });

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

  // GeoJSONスタイル関数（useCallback でメモ化 - T043）
  const getFeatureStyle = useCallback(
    (feature: GeoJSON.Feature) => {
      const prefectureCode = feature.properties?.code;
      const isHovered = hoveredPrefecture === prefectureCode;
      const isSelected = selectedPrefecture === prefectureCode;
      const isFocused = focusedPrefecture === prefectureCode;

      // 状態に応じたスタイル
      let fillColor = "#3388ff"; // デフォルト
      let weight = 2;
      let fillOpacity = 0.7;

      if (isSelected) {
        fillColor = "#ff6b35"; // 選択時：オレンジ
        weight = 3;
        fillOpacity = 0.9;
      } else if (isHovered) {
        fillColor = "#66b3ff"; // ホバー時：明るい青
        fillOpacity = 0.8;
      } else if (isFocused) {
        fillColor = "#4da6ff"; // フォーカス時：中間の青
        weight = 3; // フォーカスインジケーター（WCAG 2.1 AA準拠）
        fillOpacity = 0.8;
      }

      return {
        fillColor,
        weight,
        opacity: 1,
        color: isFocused ? "#0066cc" : "white", // フォーカス時は濃い青の境界線
        fillOpacity,
      };
    },
    [hoveredPrefecture, selectedPrefecture, focusedPrefecture],
  );

  // GeoJSONレイヤーのイベントハンドラー（useCallback でメモ化 - T043）
  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: Layer) => {
      const prefectureCode = feature.properties?.code;
      const prefectureName = feature.properties?.name;

      // マウスイベント（T037）
      layer.on({
        mouseover: () => {
          handleMouseEnter(prefectureCode);
          onPrefectureHover?.(prefectureCode);
        },
        mouseout: () => {
          handleMouseLeave();
          onPrefectureHover?.(null);
        },
        click: () => {
          handleClick(prefectureCode);
          onPrefectureClick?.(prefectureCode);
        },
      });

      // キーボードアクセシビリティ（T040）
      const element = (layer as Path).getElement?.();
      if (element) {
        element.setAttribute("role", "button");
        element.setAttribute("aria-label", `${prefectureName}を選択`);
        element.setAttribute("tabindex", "0");

        // キーボードイベント（T041）
        element.addEventListener("focus", () => handleFocus(prefectureCode));
        element.addEventListener("blur", () => handleBlur());
        element.addEventListener("keydown", (e: KeyboardEvent) => {
          // ネイティブKeyboardEventをReact.KeyboardEvent互換の形式で処理
          const syntheticEvent = {
            key: e.key,
            shiftKey: e.shiftKey,
            preventDefault: () => e.preventDefault(),
          } as React.KeyboardEvent;
          handleKeyDown(syntheticEvent);
        });
      }

      // ツールチップを設定（シンプルなLeaflet popup - T039）
      layer.bindTooltip(prefectureName, {
        permanent: false,
        direction: "top",
        className: "prefecture-tooltip",
      });
    },
    [
      handleMouseEnter,
      handleMouseLeave,
      handleClick,
      handleFocus,
      handleBlur,
      handleKeyDown,
      onPrefectureClick,
      onPrefectureHover,
    ],
  );

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
        minZoom={5} // T036
        maxZoom={10} // T036
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        aria-label="日本の都道府県地図"
      >
        {/* CartoDB Dark Matterタイルレイヤー（暗めの配色） */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* GeoJSONレイヤー - 47都道府県すべてを表示（インタラクション機能付き） */}
        <GeoJSON
          data={mapData}
          style={getFeatureStyle} // T037: 動的スタイリング
          onEachFeature={onEachFeature} // T037, T038, T039, T040, T041: イベントハンドラー
        />

        {/* 都道府県庁舎所在地マーカー（Feature: 001-prefecture-office-button） */}
        <PrefectureOfficeMarkers
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

      {/* フォーカスインジケーターのカスタムスタイル（T042） */}
      <style>{`
        .prefecture-tooltip {
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* フォーカスインジケーター（WCAG 2.1 AA準拠: 3:1コントラスト比） */
        .leaflet-interactive:focus {
          outline: 3px solid #0066cc;
          outline-offset: 2px;
        }

        .leaflet-interactive:focus-visible {
          outline: 3px solid #0066cc;
          outline-offset: 2px;
        }

        /* Prefecture Office Markers スタイル（T013） */
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
