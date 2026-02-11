/**
 * PrefectureOfficeMarkers Component
 * Feature: 001-prefecture-office-button / User Story 1 (P1)
 *
 * 日本の47都道府県の庁舎所在地にマーカーを表示するコンポーネント
 */

import { divIcon } from "leaflet";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Marker, Tooltip, useMapEvents } from "react-leaflet";
import { PrefectureOfficePopup } from "@/components/PrefectureOfficePopup";
import type { MapInteractionHandlers, MapInteractionState } from "@/hooks/useMapInteraction";
import { usePrefectureOffices } from "@/hooks/usePrefectureOffices";

export interface PrefectureOfficeMarkersProps {
  /** マーカーインタラクション状態 */
  state: Pick<MapInteractionState, "selectedCapital">;
  /** マーカーインタラクションハンドラー */
  handlers: Pick<
    MapInteractionHandlers,
    | "handleCapitalMouseEnter"
    | "handleCapitalMouseLeave"
    | "handleCapitalClick"
    | "handleCapitalFocus"
    | "handleCapitalBlur"
  >;
}

function PrefectureOfficeMarkersComponent({ state, handlers }: PrefectureOfficeMarkersProps) {
  const { data, isLoading, error } = usePrefectureOffices();
  const [zoom, setZoom] = useState(5);

  // パフォーマンスモニタリング（開発環境のみ）
  useEffect(() => {
    if (data && process.env.NODE_ENV === "development") {
      const startTime = performance.now();
      // 次のフレームでレンダリング完了を計測
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        if (renderTime > 2000) {
          console.warn(`⚠️ Marker rendering took ${renderTime.toFixed(2)}ms (expected < 2000ms)`);
        } else {
          console.log(`✓ Marker rendering completed in ${renderTime.toFixed(2)}ms`);
        }
      });
    }
  }, [data]);

  // ズームイベントをリッスン（マーカーサイズ調整用）
  useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
  });

  // ズームレベルに応じたマーカーサイズを計算（useMemoでメモ化）
  const getMarkerSize = useCallback((currentZoom: number): number => {
    // ズームレベル5で20px、ズームレベル10で30pxとなるように線形補間
    const minSize = 20;
    const maxSize = 30;
    const minZoom = 4;
    const maxZoom = 10;

    if (currentZoom <= minZoom) return minSize;
    if (currentZoom >= maxZoom) return maxSize;

    return minSize + ((currentZoom - minZoom) / (maxZoom - minZoom)) * (maxSize - minSize);
  }, []);

  const markerSize = useMemo(() => getMarkerSize(zoom), [zoom, getMarkerSize]);

  // カスタムマーカーアイコン（DOMベース + キーボードアクセシビリティ）
  const createMarkerIcon = useCallback(
    (size: number, officeName: string, prefectureCode: string) => {
      return divIcon({
        className: "prefecture-office-marker",
        html: `
        <div
          tabindex="0"
          role="button"
          aria-label="${officeName}を選択"
          data-prefecture-code="${prefectureCode}"
          style="
            width: ${size}px;
            height: ${size}px;
            background-color: #ef4444;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            cursor: pointer;
          "
        ></div>
      `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    },
    [],
  );

  // 選択された都道府県のデータを取得（useMemoでメモ化）
  const selectedPrefecture = useMemo(() => {
    if (!data) return null;
    return state.selectedCapital
      ? data.find((office) => office.code === state.selectedCapital)
      : null;
  }, [state.selectedCapital, data]);

  // ローディング中・エラー時・データなしの場合は何も表示しない
  // （エラーはusePrefectureOfficesフック内でログ出力済み）
  if (isLoading || error || !data) {
    return null;
  }

  return (
    <>
      {data.map((office) => {
        const markerIcon = createMarkerIcon(markerSize, office.officeName, office.code);

        return (
          <Marker
            key={office.code}
            position={[office.lat, office.lon]}
            icon={markerIcon}
            keyboard={true}
            eventHandlers={{
              mouseover: () => handlers.handleCapitalMouseEnter(office.code),
              mouseout: () => handlers.handleCapitalMouseLeave(),
              click: () => handlers.handleCapitalClick(office.code),
              focus: () => handlers.handleCapitalFocus(office.code),
              blur: () => handlers.handleCapitalBlur(),
              keydown: (e: { originalEvent: KeyboardEvent }) => {
                // EnterまたはSpaceキーでクリックと同じ動作
                if (e.originalEvent.key === "Enter" || e.originalEvent.key === " ") {
                  e.originalEvent.preventDefault();
                  handlers.handleCapitalClick(office.code);
                }
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -markerSize / 2]} opacity={0.9}>
              <div style={{ fontSize: "12px", fontWeight: "500" }}>{office.officeName}</div>
            </Tooltip>
          </Marker>
        );
      })}

      {/* 選択されたマーカーのポップアップを表示 */}
      {selectedPrefecture && (
        <PrefectureOfficePopup
          prefecture={selectedPrefecture}
          onClose={() => handlers.handleCapitalClick("")}
        />
      )}
    </>
  );
}

// React.memoでパフォーマンス最適化
export const PrefectureOfficeMarkers = memo(PrefectureOfficeMarkersComponent);
