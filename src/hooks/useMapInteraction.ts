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
  /** ホバー中の庁舎所在地コード */
  hoveredCapital: string | null;
  /** 選択中の庁舎所在地コード */
  selectedCapital: string | null;
  /** キーボードフォーカス中の庁舎所在地コード */
  focusedCapital: string | null;
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
  /** 庁舎所在地マーカーのマウスエンター時のハンドラー */
  handleCapitalMouseEnter: (prefectureCode: string) => void;
  /** 庁舎所在地マーカーのマウスリーブ時のハンドラー */
  handleCapitalMouseLeave: () => void;
  /** 庁舎所在地マーカーのクリック時のハンドラー */
  handleCapitalClick: (prefectureCode: string) => void;
  /** 庁舎所在地マーカーのフォーカス時のハンドラー */
  handleCapitalFocus: (prefectureCode: string) => void;
  /** 庁舎所在地マーカーのブラー時のハンドラー */
  handleCapitalBlur: () => void;
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

  // 庁舎所在地マーカー用の状態
  const [hoveredCapital, setHoveredCapital] = useState<string | null>(null);
  const [selectedCapital, setSelectedCapital] = useState<string | null>(null);
  const [focusedCapital, setFocusedCapital] = useState<string | null>(null);

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
    setSelectedCapital(null);
  }, []);

  // 庁舎所在地マーカー用のハンドラー
  const handleCapitalMouseEnter = useCallback((prefectureCode: string) => {
    setHoveredCapital(prefectureCode);
  }, []);

  const handleCapitalMouseLeave = useCallback(() => {
    setHoveredCapital(null);
  }, []);

  const handleCapitalClick = useCallback((prefectureCode: string) => {
    setSelectedCapital((prev) => {
      // 同じ庁舎をクリックした場合は選択解除
      if (prev === prefectureCode) {
        return null;
      }
      return prefectureCode;
    });
  }, []);

  const handleCapitalFocus = useCallback((prefectureCode: string) => {
    setFocusedCapital(prefectureCode);
  }, []);

  const handleCapitalBlur = useCallback(() => {
    setFocusedCapital(null);
  }, []);

  return {
    hoveredPrefecture,
    selectedPrefecture,
    focusedPrefecture,
    hoveredCapital,
    selectedCapital,
    focusedCapital,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleFocus,
    handleBlur,
    handleClickOutside,
    handleCapitalMouseEnter,
    handleCapitalMouseLeave,
    handleCapitalClick,
    handleCapitalFocus,
    handleCapitalBlur,
  };
}
