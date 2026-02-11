import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMapInteraction } from "./useMapInteraction";

describe("useMapInteraction", () => {
  it("should initialize with null states", () => {
    const { result } = renderHook(() => useMapInteraction());

    expect(result.current.hoveredPrefecture).toBeNull();
    expect(result.current.selectedPrefecture).toBeNull();
    expect(result.current.focusedPrefecture).toBeNull();
  });

  it("should handle mouse enter event", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleMouseEnter("13"); // 東京都
    });

    expect(result.current.hoveredPrefecture).toBe("13");
    expect(result.current.selectedPrefecture).toBeNull();
    expect(result.current.focusedPrefecture).toBeNull();
  });

  it("should handle mouse leave event", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleMouseEnter("13");
    });

    expect(result.current.hoveredPrefecture).toBe("13");

    act(() => {
      result.current.handleMouseLeave();
    });

    expect(result.current.hoveredPrefecture).toBeNull();
  });

  it("should handle click event", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleClick("13");
    });

    expect(result.current.selectedPrefecture).toBe("13");
    expect(result.current.hoveredPrefecture).toBeNull();
    expect(result.current.focusedPrefecture).toBeNull();
  });

  it("should clear selection when clicking the same prefecture", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleClick("13");
    });

    expect(result.current.selectedPrefecture).toBe("13");

    act(() => {
      result.current.handleClick("13");
    });

    expect(result.current.selectedPrefecture).toBeNull();
  });

  it("should change selection when clicking a different prefecture", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleClick("13"); // 東京都
    });

    expect(result.current.selectedPrefecture).toBe("13");

    act(() => {
      result.current.handleClick("14"); // 神奈川県
    });

    expect(result.current.selectedPrefecture).toBe("14");
  });

  it("should handle focus event", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleFocus("13");
    });

    expect(result.current.focusedPrefecture).toBe("13");
    expect(result.current.hoveredPrefecture).toBeNull();
    expect(result.current.selectedPrefecture).toBeNull();
  });

  it("should handle blur event", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleFocus("13");
    });

    expect(result.current.focusedPrefecture).toBe("13");

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.focusedPrefecture).toBeNull();
  });

  it("should clear selection on click outside", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleClick("13");
    });

    expect(result.current.selectedPrefecture).toBe("13");

    act(() => {
      result.current.handleClickOutside();
    });

    expect(result.current.selectedPrefecture).toBeNull();
  });

  it("should maintain independent state for hover, select, and focus", () => {
    const { result } = renderHook(() => useMapInteraction());

    // Set all three states
    act(() => {
      result.current.handleMouseEnter("13");
      result.current.handleClick("14");
      result.current.handleFocus("27");
    });

    expect(result.current.hoveredPrefecture).toBe("13");
    expect(result.current.selectedPrefecture).toBe("14");
    expect(result.current.focusedPrefecture).toBe("27");

    // Clear hover shouldn't affect others
    act(() => {
      result.current.handleMouseLeave();
    });

    expect(result.current.hoveredPrefecture).toBeNull();
    expect(result.current.selectedPrefecture).toBe("14");
    expect(result.current.focusedPrefecture).toBe("27");
  });
});
