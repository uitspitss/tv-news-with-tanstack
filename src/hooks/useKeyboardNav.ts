import { useCallback, useState } from "react";

/**
 * キーボードナビゲーション管理フック
 * Tab/Shift+Tab、Enter/Space、矢印キーでの都道府県選択をサポート
 */
export interface KeyboardNavReturn {
  /** 現在フォーカス中の都道府県インデックス */
  focusedIndex: number;
  /** 現在フォーカス中の都道府県コード */
  focusedPrefecture: string | null;
  /** キーボードイベントハンドラー */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** フォーカスを移動する関数 */
  moveFocus: (direction: "next" | "prev") => void;
  /** フォーカスインデックスを設定する関数 */
  setFocusedIndex: (index: number) => void;
}

/**
 * キーボードナビゲーション管理フック
 *
 * @param prefectureCodes - 都道府県コードの配列
 * @param onSelect - 都道府県選択時のコールバック（Enter/Spaceキー）
 *
 * @example
 * ```tsx
 * const { focusedIndex, handleKeyDown } = useKeyboardNav(
 *   ['01', '02', '03'],
 *   (code) => console.log('Selected:', code)
 * );
 * ```
 */
export function useKeyboardNav(
  prefectureCodes: string[],
  onSelect?: (prefectureCode: string) => void,
): KeyboardNavReturn {
  const [focusedIndex, setFocusedIndexState] = useState<number>(-1);

  const focusedPrefecture = focusedIndex >= 0 ? prefectureCodes[focusedIndex] : null;

  const setFocusedIndex = useCallback((index: number) => {
    setFocusedIndexState(index);
  }, []);

  const moveFocus = useCallback(
    (direction: "next" | "prev") => {
      setFocusedIndexState((prevIndex) => {
        if (prefectureCodes.length === 0) return -1;

        let newIndex: number;

        if (prevIndex === -1) {
          // 初回フォーカス
          newIndex = direction === "next" ? 0 : prefectureCodes.length - 1;
        } else if (direction === "next") {
          // 次へ移動（末尾で先頭に戻る）
          newIndex = (prevIndex + 1) % prefectureCodes.length;
        } else {
          // 前へ移動（先頭で末尾に戻る）
          newIndex = prevIndex === 0 ? prefectureCodes.length - 1 : prevIndex - 1;
        }

        return newIndex;
      });
    },
    [prefectureCodes.length],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key, shiftKey } = event;

      switch (key) {
        case "Tab":
          event.preventDefault();
          moveFocus(shiftKey ? "prev" : "next");
          break;

        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          moveFocus("next");
          break;

        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          moveFocus("prev");
          break;

        case "Enter":
        case " ": // Space key
          event.preventDefault();
          if (focusedPrefecture && onSelect) {
            onSelect(focusedPrefecture);
          }
          break;

        case "Escape":
          event.preventDefault();
          setFocusedIndexState(-1);
          break;

        default:
          // 他のキーは無視
          break;
      }
    },
    [focusedPrefecture, moveFocus, onSelect],
  );

  return {
    focusedIndex,
    focusedPrefecture,
    handleKeyDown,
    moveFocus,
    setFocusedIndex,
  };
}
