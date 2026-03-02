import { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

const MIN_ZOOM = 5;
const MAX_ZOOM = 10;
const MIN_FONT_SIZE = 9;
const MAX_FONT_SIZE = 16;

export function calcFontSize(zoom: number): number {
  const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  const ratio = (clamped - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM);
  return Math.round(MIN_FONT_SIZE + ratio * (MAX_FONT_SIZE - MIN_FONT_SIZE));
}

function applyFontSize(container: HTMLElement, zoom: number): void {
  const size = calcFontSize(zoom);
  container.style.setProperty("--broadcast-font-size", `${size}px`);
  container.style.setProperty("--broadcast-line-height", `${Math.round(size * 1.45)}px`);
}

export function BroadcastFontSizeController() {
  const map = useMapEvents({
    zoomend: () => {
      applyFontSize(map.getContainer(), map.getZoom());
    },
  });

  useEffect(() => {
    applyFontSize(map.getContainer(), map.getZoom());
  }, [map]);

  return null;
}
