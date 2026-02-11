import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useKeyboardNav } from "./useKeyboardNav";

describe("useKeyboardNav", () => {
  const prefectureCodes = ["01", "02", "03", "04", "05"]; // Mock prefecture codes

  it("should initialize with focusedIndex -1 (no focus)", () => {
    const { result } = renderHook(() => useKeyboardNav(prefectureCodes));

    expect(result.current.focusedIndex).toBe(-1);
    expect(result.current.focusedPrefecture).toBeNull();
  });

  it("should move focus to next prefecture on Tab key", () => {
    const { result } = renderHook(() => useKeyboardNav(prefectureCodes));

    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Tab" });
      result.current.handleKeyDown(event as any);
    });

    expect(result.current.focusedIndex).toBe(0);
    expect(result.current.focusedPrefecture).toBe("01");
  });

  it("should move focus to previous prefecture on Shift+Tab", () => {
    const { result } = renderHook(() => useKeyboardNav(prefectureCodes));

    // First, move to index 2
    act(() => {
      result.current.setFocusedIndex(2);
    });

    expect(result.current.focusedIndex).toBe(2);

    // Then press Shift+Tab
    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true });
      result.current.handleKeyDown(event as any);
    });

    expect(result.current.focusedIndex).toBe(1);
    expect(result.current.focusedPrefecture).toBe("02");
  });

  it("should cycle focus to first prefecture when at the end", () => {
    const { result } = renderHook(() => useKeyboardNav(prefectureCodes));

    // Move to last prefecture
    act(() => {
      result.current.setFocusedIndex(4); // Last index
    });

    expect(result.current.focusedIndex).toBe(4);

    // Press Tab to cycle to first
    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Tab" });
      result.current.handleKeyDown(event as any);
    });

    expect(result.current.focusedIndex).toBe(0);
    expect(result.current.focusedPrefecture).toBe("01");
  });

  it("should cycle focus to last prefecture when at the beginning with Shift+Tab", () => {
    const { result } = renderHook(() => useKeyboardNav(prefectureCodes));

    // Move to first prefecture
    act(() => {
      result.current.setFocusedIndex(0);
    });

    // Press Shift+Tab to cycle to last
    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true });
      result.current.handleKeyDown(event as any);
    });

    expect(result.current.focusedIndex).toBe(4);
    expect(result.current.focusedPrefecture).toBe("05");
  });

  it("should trigger onSelect callback on Enter key", () => {
    let selectedPrefecture: string | null = null;
    const onSelect = (code: string) => {
      selectedPrefecture = code;
    };

    const { result } = renderHook(() => useKeyboardNav(prefectureCodes, onSelect));

    // Focus on prefecture
    act(() => {
      result.current.setFocusedIndex(2);
    });

    // Press Enter
    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      result.current.handleKeyDown(event as any);
    });

    expect(selectedPrefecture).toBe("03");
  });

  it("should trigger onSelect callback on Space key", () => {
    let selectedPrefecture: string | null = null;
    const onSelect = (code: string) => {
      selectedPrefecture = code;
    };

    const { result } = renderHook(() => useKeyboardNav(prefectureCodes, onSelect));

    // Focus on prefecture
    act(() => {
      result.current.setFocusedIndex(1);
    });

    // Press Space
    act(() => {
      const event = new KeyboardEvent("keydown", { key: " " });
      result.current.handleKeyDown(event as any);
    });

    expect(selectedPrefecture).toBe("02");
  });

  it("should not trigger onSelect when no prefecture is focused", () => {
    let selectedPrefecture: string | null = null;
    const onSelect = (code: string) => {
      selectedPrefecture = code;
    };

    const { result } = renderHook(() => useKeyboardNav(prefectureCodes, onSelect));

    // Don't focus on any prefecture
    expect(result.current.focusedIndex).toBe(-1);

    // Press Enter
    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      result.current.handleKeyDown(event as any);
    });

    expect(selectedPrefecture).toBeNull();
  });

  it("should move focus using arrow keys", () => {
    const { result } = renderHook(() => useKeyboardNav(prefectureCodes));

    // Start at index 0
    act(() => {
      result.current.setFocusedIndex(0);
    });

    // Press ArrowDown to move to next
    act(() => {
      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      result.current.handleKeyDown(event as any);
    });

    expect(result.current.focusedIndex).toBe(1);

    // Press ArrowUp to move to previous
    act(() => {
      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      result.current.handleKeyDown(event as any);
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it("should ignore non-navigation keys", () => {
    const { result } = renderHook(() => useKeyboardNav(prefectureCodes));

    act(() => {
      result.current.setFocusedIndex(2);
    });

    const initialIndex = result.current.focusedIndex;

    // Press a random key
    act(() => {
      const event = new KeyboardEvent("keydown", { key: "a" });
      result.current.handleKeyDown(event as any);
    });

    // Index should not change
    expect(result.current.focusedIndex).toBe(initialIndex);
  });
});
