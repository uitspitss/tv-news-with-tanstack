import { describe, expect, it, vi } from "vitest";

vi.mock("react-leaflet", () => ({
  useMapEvents: () => null,
}));

import { calcFontSize } from "./broadcast-font-size-controller";

describe("calcFontSize", () => {
  it("ズーム5で9pxを返す", () => {
    expect(calcFontSize(5)).toBe(9);
  });

  it("ズーム10で16pxを返す", () => {
    expect(calcFontSize(10)).toBe(16);
  });

  it("ズーム7で中間値を返す", () => {
    // (7-5)/(10-5) = 0.4 → 9 + 0.4*7 = 11.8 → 12
    expect(calcFontSize(7)).toBe(12);
  });

  it("ズーム8で中間値を返す", () => {
    // (8-5)/(10-5) = 0.6 → 9 + 0.6*7 = 13.2 → 13
    expect(calcFontSize(8)).toBe(13);
  });

  it("最小ズーム以下でも9pxにクランプされる", () => {
    expect(calcFontSize(3)).toBe(9);
  });

  it("最大ズーム以上でも16pxにクランプされる", () => {
    expect(calcFontSize(15)).toBe(16);
  });
});
