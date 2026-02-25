import { useCallback, useState } from "react";

/**
 * 地図インタラクション状態の管理フック
 * 都道府県庁舎所在地マーカーの選択状態を管理
 */
export interface MapInteractionState {
  /** 選択中の庁舎所在地コード */
  selectedCapital: string | null;
}

export interface MapInteractionHandlers {
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

type MapInteractionReturn = MapInteractionState & MapInteractionHandlers;

/**
 * 地図インタラクション管理フック
 *
 * @example
 * ```tsx
 * const {
 *   selectedCapital,
 *   handleCapitalClick,
 * } = useMapInteraction();
 * ```
 */
export function useMapInteraction(): MapInteractionReturn {
  // 庁舎所在地マーカー用の状態
  const [selectedCapital, setSelectedCapital] = useState<string | null>(null);

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
    selectedCapital,
    handleCapitalMouseEnter,
    handleCapitalMouseLeave,
    handleCapitalClick,
    handleCapitalFocus,
    handleCapitalBlur,
  };
}
