import { useCallback, useState } from "react";

/**
 * 地図インタラクション状態の管理フック
 * ホバー、クリック、フォーカス状態を独立して管理
 */
export interface MapInteractionState {
  /** ホバー中の都道府県コード */
  hoveredPrefecture: string | null;
  /** 選択中の都道府県コード */
  selectedPrefecture: string | null;
  /** キーボードフォーカス中の都道府県コード */
  focusedPrefecture: string | null;
}

export interface MapInteractionHandlers {
  /** マウスエンター時のハンドラー */
  handleMouseEnter: (prefectureCode: string) => void;
  /** マウスリーブ時のハンドラー */
  handleMouseLeave: () => void;
  /** クリック時のハンドラー */
  handleClick: (prefectureCode: string) => void;
  /** フォーカス時のハンドラー */
  handleFocus: (prefectureCode: string) => void;
  /** ブラー時のハンドラー */
  handleBlur: () => void;
  /** 外側クリック時のハンドラー */
  handleClickOutside: () => void;
}

export type MapInteractionReturn = MapInteractionState & MapInteractionHandlers;

/**
 * 地図インタラクション管理フック
 *
 * @example
 * ```tsx
 * const {
 *   hoveredPrefecture,
 *   selectedPrefecture,
 *   handleMouseEnter,
 *   handleClick,
 * } = useMapInteraction();
 * ```
 */
export function useMapInteraction(): MapInteractionReturn {
  const [hoveredPrefecture, setHoveredPrefecture] = useState<string | null>(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [focusedPrefecture, setFocusedPrefecture] = useState<string | null>(null);

  const handleMouseEnter = useCallback((prefectureCode: string) => {
    setHoveredPrefecture(prefectureCode);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredPrefecture(null);
  }, []);

  const handleClick = useCallback((prefectureCode: string) => {
    setSelectedPrefecture((prev) => {
      // 同じ都道府県をクリックした場合は選択解除
      if (prev === prefectureCode) {
        return null;
      }
      return prefectureCode;
    });
  }, []);

  const handleFocus = useCallback((prefectureCode: string) => {
    setFocusedPrefecture(prefectureCode);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedPrefecture(null);
  }, []);

  const handleClickOutside = useCallback(() => {
    setSelectedPrefecture(null);
  }, []);

  return {
    hoveredPrefecture,
    selectedPrefecture,
    focusedPrefecture,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleFocus,
    handleBlur,
    handleClickOutside,
  };
}
