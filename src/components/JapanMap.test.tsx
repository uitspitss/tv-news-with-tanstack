/**
 * JapanMapコンポーネントのテスト
 * Feature: 001-prefecture-office-button
 */

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JapanMap } from "./JapanMap";

// Leafletのモック
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="prefecture-office-marker">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="marker-tooltip">{children}</div>,
  useMapEvents: () => null,
}));

// PrefectureOfficeMarkersのモック
vi.mock("@/components/PrefectureOfficeMarkers", () => ({
  PrefectureOfficeMarkers: () => <div data-testid="prefecture-office-markers" />,
}));

describe("JapanMap", () => {
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

  it("初期ズームレベルを設定できる", async () => {
    render(<JapanMap initialZoom={7} />);
    await waitFor(() => {
      const mapContainer = screen.getByTestId("map-container");
      expect(mapContainer).toBeInTheDocument();
    });
  });

  it("初期中心座標を設定できる", async () => {
    render(<JapanMap initialCenter={[140, 37]} />);
    await waitFor(() => {
      const mapContainer = screen.getByTestId("map-container");
      expect(mapContainer).toBeInTheDocument();
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

describe("JapanMap - Prefecture Office Markers", () => {
  it("should render PrefectureOfficeMarkers component", async () => {
    render(<JapanMap />);

    await waitFor(() => {
      expect(screen.getByTestId("prefecture-office-markers")).toBeInTheDocument();
    });
  });

  it("should render markers and map container together", async () => {
    render(<JapanMap />);

    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
      expect(screen.getByTestId("prefecture-office-markers")).toBeInTheDocument();
    });
  });
});
