import "@testing-library/jest-dom";
import { vi } from "vitest";

// Vitestの組み込みjsdom環境を使用するため、基本的な手動セットアップは不要
// ただし、Leaflet等のブラウザ依存ライブラリのために追加のモックが必要

// requestAnimationFrame と cancelAnimationFrame のモック
if (typeof window !== "undefined") {
  window.requestAnimationFrame = vi.fn((callback) => {
    setTimeout(callback, 0);
    return 0;
  });

  window.cancelAnimationFrame = vi.fn();

  // HTMLCanvasElement のモック
  if (typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  }
}
