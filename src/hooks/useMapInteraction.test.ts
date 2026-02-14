import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMapInteraction } from "./useMapInteraction";

describe("useMapInteraction", () => {
  it("should initialize with null state for selectedCapital", () => {
    const { result } = renderHook(() => useMapInteraction());

    expect(result.current.selectedCapital).toBeNull();
  });

  it("should handle capital click event", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleCapitalClick("13"); // 東京都
    });

    expect(result.current.selectedCapital).toBe("13");
  });

  it("should clear selection when clicking the same capital", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleCapitalClick("13");
    });

    expect(result.current.selectedCapital).toBe("13");

    act(() => {
      result.current.handleCapitalClick("13");
    });

    expect(result.current.selectedCapital).toBeNull();
  });

  it("should change selection when clicking a different capital", () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => {
      result.current.handleCapitalClick("13"); // 東京都
    });

    expect(result.current.selectedCapital).toBe("13");

    act(() => {
      result.current.handleCapitalClick("14"); // 神奈川県
    });

    expect(result.current.selectedCapital).toBe("14");
  });

  it("should provide all required handlers", () => {
    const { result } = renderHook(() => useMapInteraction());

    expect(typeof result.current.handleCapitalMouseEnter).toBe("function");
    expect(typeof result.current.handleCapitalMouseLeave).toBe("function");
    expect(typeof result.current.handleCapitalClick).toBe("function");
    expect(typeof result.current.handleCapitalFocus).toBe("function");
    expect(typeof result.current.handleCapitalBlur).toBe("function");
  });
});
