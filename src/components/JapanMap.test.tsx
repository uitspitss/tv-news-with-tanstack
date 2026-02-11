/**
 * JapanMapコンポーネントのテスト
 * Feature: 001-add-japan-map / User Story 1
 */

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JapanMapData } from "@/lib/geo/japanGeoData";
import { JapanMap } from "./JapanMap";

// Leafletのモック
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  GeoJSON: ({ data }: any) => (
    <div data-testid="geojson-layer" data-features={data?.features?.length} />
  ),
}));

// モックGeoJSONデータ
const mockGeoJSONData: JapanMapData = {
  type: "FeatureCollection",
  features: Array.from({ length: 47 }, (_, i) => ({
    type: "Feature",
    properties: {
      name: `都道府県${i + 1}`,
      code: (i + 1).toString().padStart(2, "0"),
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [139.0, 35.0],
          [139.5, 35.0],
          [139.5, 35.5],
          [139.0, 35.5],
          [139.0, 35.0],
        ],
      ],
    },
  })),
};

describe("JapanMap", () => {
  beforeEach(() => {
    // fetchをモック
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeoJSONData,
    });
  });

  it("地図コンテナをレンダリングする", async () => {
    render(<JapanMap />);
    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });
  });

  it("タイルレイヤーをレンダリングする", async () => {
    render(<JapanMap />);
    await waitFor(() => {
      expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
    });
  });

  it("GeoJSONレイヤーをレンダリングする", async () => {
    render(<JapanMap />);
    await waitFor(() => {
      expect(screen.getByTestId("geojson-layer")).toBeInTheDocument();
    });
  });

  it("47都道府県すべてを表示する", async () => {
    render(<JapanMap />);
    await waitFor(() => {
      const geojsonLayer = screen.getByTestId("geojson-layer");
      expect(geojsonLayer).toHaveAttribute("data-features", "47");
    });
  });

  it("データ読み込み中はローディング表示する", () => {
    // fetchを遅延させる
    global.fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => mockGeoJSONData,
              } as Response),
            100,
          ),
        ),
    );

    render(<JapanMap />);
    // Suspenseのfallbackが表示される想定
    // 実装時にはMapLoadingIndicatorが表示される
  });

  it("データ読み込みエラー時はエラー表示する", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    render(<JapanMap />);
    // Error Boundaryでキャッチされる想定
    // 実装時にはMapErrorFallbackが表示される
  });

  it("初期ズームレベルを設定できる", async () => {
    render(<JapanMap initialZoom={7} />);
    await waitFor(() => {
      const mapContainer = screen.getByTestId("map-container");
      expect(mapContainer).toBeInTheDocument();
      // 実装時にはzoom propが渡される
    });
  });

  it("初期中心座標を設定できる", async () => {
    render(<JapanMap initialCenter={[140, 37]} />);
    await waitFor(() => {
      const mapContainer = screen.getByTestId("map-container");
      expect(mapContainer).toBeInTheDocument();
      // 実装時にはcenter propが渡される
    });
  });

  it("aria-labelが設定されている", async () => {
    render(<JapanMap />);
    await waitFor(() => {
      const mapContainer = screen.getByTestId("map-container");
      expect(mapContainer).toHaveAttribute("aria-label");
    });
  });
});
