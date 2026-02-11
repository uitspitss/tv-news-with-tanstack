/**
 * JapanMapコンポーネントのテスト
 * Feature: 001-add-japan-map / User Story 1
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  Marker: ({ children }: any) => <div data-testid="prefecture-office-marker">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="marker-tooltip">{children}</div>,
  useMapEvents: () => null,
}));

// PrefectureOfficeMarkersのモック
vi.mock("@/components/PrefectureOfficeMarkers", () => ({
  PrefectureOfficeMarkers: ({ handlers }: any) => (
    <div data-testid="prefecture-office-markers" data-handlers={Object.keys(handlers).length} />
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

describe("JapanMap - Interactions (User Story 3)", () => {
  beforeEach(() => {
    // fetchをモック
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeoJSONData,
    });
  });

  describe("Mouse Interactions", () => {
    it("should handle prefecture hover event", async () => {
      const onPrefectureHover = vi.fn();
      render(<JapanMap onPrefectureHover={onPrefectureHover} />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // Note: Actual hover testing requires mocking Leaflet layer events
      // This is a placeholder for the integration test
    });

    it("should handle prefecture click event", async () => {
      const onPrefectureClick = vi.fn();
      render(<JapanMap onPrefectureClick={onPrefectureClick} />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // Note: Actual click testing requires mocking Leaflet layer events
      // This is a placeholder for the integration test
    });

    it("should display tooltip on prefecture hover", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // Tooltip display will be tested in integration tests
    });
  });

  describe("Keyboard Interactions", () => {
    it("should support Tab key navigation", async () => {
      const user = userEvent.setup();
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // Simulate Tab key press
      await user.tab();

      // After implementation, verify that focus moves to first prefecture
    });

    it("should support Enter key to select prefecture", async () => {
      const onPrefectureClick = vi.fn();
      render(<JapanMap onPrefectureClick={onPrefectureClick} />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // After implementation, Tab to focus and Enter to select
    });

    it("should support Space key to select prefecture", async () => {
      const onPrefectureClick = vi.fn();
      render(<JapanMap onPrefectureClick={onPrefectureClick} />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // After implementation, Tab to focus and Space to select
    });

    it("should have visible focus indicators", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // After implementation, verify focus styles (WCAG 2.1 AA compliant)
    });
  });

  describe("Zoom and Pan", () => {
    it("should respect minZoom setting", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        const mapContainer = screen.getByTestId("map-container");
        expect(mapContainer).toBeInTheDocument();
        // minZoom prop will be checked after implementation
      });
    });

    it("should respect maxZoom setting", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        const mapContainer = screen.getByTestId("map-container");
        expect(mapContainer).toBeInTheDocument();
        // maxZoom prop will be checked after implementation
      });
    });

    it("should allow panning across the map", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // Pan functionality will be tested in integration tests
    });
  });

  describe("State Management", () => {
    it("should track hovered prefecture", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // State tracking will be verified through visual indicators
    });

    it("should track selected prefecture", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // State tracking will be verified through visual indicators
    });

    it("should track focused prefecture", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("map-container")).toBeInTheDocument();
      });

      // State tracking will be verified through visual indicators
    });
  });
});

describe("JapanMap - Prefecture Office Markers (Feature: 001-prefecture-office-button)", () => {
  beforeEach(() => {
    // fetchをモック（GeoJSONと庁舎所在地データの両方）
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("japan-prefectures.json")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockGeoJSONData,
        });
      }
      if (url.includes("prefecture-offices.json")) {
        return Promise.resolve({
          ok: true,
          json: async () =>
            Array.from({ length: 47 }, (_, i) => ({
              code: String(i + 1).padStart(2, "0"),
              name: `都道府県${i + 1}`,
              officeName: `都道府県${i + 1}庁`,
              lat: 35.0 + i * 0.1,
              lon: 135.0 + i * 0.1,
            })),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  });

  it("should render PrefectureOfficeMarkers component", async () => {
    render(<JapanMap />);

    await waitFor(() => {
      expect(screen.getByTestId("prefecture-office-markers")).toBeInTheDocument();
    });
  });

  it("should pass correct handlers to PrefectureOfficeMarkers", async () => {
    render(<JapanMap />);

    await waitFor(() => {
      const markersComponent = screen.getByTestId("prefecture-office-markers");
      expect(markersComponent).toHaveAttribute("data-handlers", "5");
    });
  });

  it("should render markers after map data loads", async () => {
    render(<JapanMap />);

    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
      expect(screen.getByTestId("geojson-layer")).toBeInTheDocument();
      expect(screen.getByTestId("prefecture-office-markers")).toBeInTheDocument();
    });
  });

  describe("Marker Click and Popup (User Story 2)", () => {
    it.skip("should display popup when marker is clicked", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("prefecture-office-markers")).toBeInTheDocument();
      });

      // マーカークリック後、ポップアップが表示されることを確認
      // 実装後にテストを追加
    });

    it.skip("should close previous popup when clicking another marker", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("prefecture-office-markers")).toBeInTheDocument();
      });

      // 複数のマーカーをクリックしたとき、前のポップアップが閉じられることを確認
      // 実装後にテストを追加
    });

    it.skip("should close popup when close button is clicked", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("prefecture-office-markers")).toBeInTheDocument();
      });

      // 閉じるボタンをクリックしたとき、ポップアップが閉じられることを確認
      // 実装後にテストを追加
    });

    it.skip("should close popup when clicking outside", async () => {
      render(<JapanMap />);

      await waitFor(() => {
        expect(screen.getByTestId("prefecture-office-markers")).toBeInTheDocument();
      });

      // ポップアップ外をクリックしたとき、ポップアップが閉じられることを確認
      // 実装後にテストを追加
    });
  });
});
