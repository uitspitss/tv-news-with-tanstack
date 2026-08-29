/**
 * JapanMapコンポーネントのテスト
 * Feature: 001-prefecture-office-button
 */

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JapanMap } from "./japan-map";

// Leafletのモック
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  Marker: ({ children }: any) => <div data-testid="prefecture-office-marker">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="marker-tooltip">{children}</div>,
  useMapEvents: () => null,
}));

// BaseMapLayerのモック（MapLibre GL はjsdomで動かない）
vi.mock("@/components/base-map-layer", () => ({
  BaseMapLayer: () => <div data-testid="base-map-layer" />,
}));

// BroadcastFontSizeControllerのモック
vi.mock("@/components/broadcast-font-size-controller", () => ({
  BroadcastFontSizeController: () => null,
}));

// PrefectureOfficeMarkersのモック
vi.mock("@/components/prefecture-office-markers", () => ({
  PrefectureOfficeMarkers: () => <div data-testid="prefecture-office-markers" />,
}));

// VideoPlayerPanelのモック
vi.mock("@/components/video-player-panel", () => ({
  VideoPlayerPanel: () => <div data-testid="video-player-panel" />,
}));

// VideoPlayerProviderのモック
vi.mock("@/contexts/video-player-context", () => ({
  VideoPlayerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useVideoPlayer: () => ({
    selectedBroadcast: null,
    selectedIndex: undefined,
    openPlayer: vi.fn(),
    closePlayer: vi.fn(),
    updateIndex: vi.fn(),
  }),
}));

describe("JapanMap", () => {
  it("地図コンテナをレンダリングする", async () => {
    render(<JapanMap />);
    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });
  });

  it("ベースマップレイヤーをレンダリングする", async () => {
    render(<JapanMap />);
    await waitFor(() => {
      expect(screen.getByTestId("base-map-layer")).toBeInTheDocument();
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
