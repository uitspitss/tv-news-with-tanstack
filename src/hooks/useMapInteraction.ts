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
  /** 選択中の庁舎所在地コード */
  selectedCapital: string | null;
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
  const [selectedCapital, setSelectedCapital] = useState<string | null>(null);

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
  const handleCapitalMouseEnter = useCallback((_prefectureCode: string) => {
    // ホバー効果は CSS で実装されているため、状態管理は不要
  }, []);

  const handleCapitalMouseLeave = useCallback(() => {
    // ホバー効果は CSS で実装されているため、状態管理は不要
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

  const handleCapitalFocus = useCallback((_prefectureCode: string) => {
    // フォーカス効果は CSS で実装されているため、状態管理は不要
  }, []);

  const handleCapitalBlur = useCallback(() => {
    // フォーカス効果は CSS で実装されているため、状態管理は不要
  }, []);

  return {
    hoveredPrefecture,
    selectedPrefecture,
    focusedPrefecture,
    selectedCapital,
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
