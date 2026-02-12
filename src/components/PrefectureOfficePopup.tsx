/**
 * PrefectureOfficePopup Component
 * Feature: 001-prefecture-office-button / User Story 2 (P2)
 *
 * 都道府県庁舎所在地マーカークリック時に表示されるポップアップ
 */

import { memo, useEffect } from "react";
import { Popup } from "react-leaflet";
import type { PrefectureOffice } from "@/lib/geo/prefectureOfficeData";

export interface PrefectureOfficePopupProps {
  /** 表示する都道府県庁舎情報 */
  prefecture: PrefectureOffice;
  /** ポップアップを閉じるコールバック */
  onClose: () => void;
}

function PrefectureOfficePopupComponent({ prefecture, onClose }: PrefectureOfficePopupProps) {
  // Escキーでポップアップを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <Popup
      position={[prefecture.lat, prefecture.lon]}
      eventHandlers={{
        remove: onClose,
      }}
      closeButton={true}
      closeOnClick={false} // マーカークリックで閉じないようにする
      autoClose={false} // 他のポップアップを開いたときに自動で閉じないようにする
      className="prefecture-office-popup"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        style={{
          padding: "8px",
          minWidth: "150px",
        }}
      >
        <h3
          id="popup-title"
          style={{
            margin: "0 0 4px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#1f2937",
          }}
        >
          {prefecture.name}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          {prefecture.officeName}
        </p>
      </div>
    </Popup>
  );
}

// React.memoでパフォーマンス最適化
export const PrefectureOfficePopup = memo(PrefectureOfficePopupComponent);
