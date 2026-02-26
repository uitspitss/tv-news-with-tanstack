import type { DivIcon } from "leaflet";
import { divIcon } from "leaflet";
import { memo, useMemo } from "react";
import { Marker } from "react-leaflet";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { usePrefectureOffices } from "@/hooks/usePrefectureOffices";

function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return str.replaceAll(/[&<>"']/g, (char) => escapeMap[char] || char);
}

// 複合エリア（"鳥取県/島根県"等）はスラッシュ前の県のみに表示する
function getPrimaryPrefecture(prefecture: string): string {
  return prefecture.split("/")[0];
}

function createBroadcastLabelIcon(broadcastNames: string[]) {
  const LINE_HEIGHT = 17;
  const height = Math.max(broadcastNames.length * LINE_HEIGHT, LINE_HEIGHT);
  const linesHtml = broadcastNames
    .map((name) => `<div class="broadcast-name">${escapeHtml(name)}</div>`)
    .join("");

  return divIcon({
    className: "broadcast-label-marker",
    html: `<div class="broadcast-label-container">${linesHtml}</div>`,
    iconSize: [120, height],
    iconAnchor: [60, height / 2],
  });
}

function PrefectureOfficeMarkersComponent() {
  const {
    data: officeData,
    isLoading: officesLoading,
    error: officesError,
  } = usePrefectureOffices();
  const {
    data: broadcastData,
    isLoading: broadcastsLoading,
    error: broadcastsError,
  } = useBroadcasts();

  const broadcastsByPrefecture = useMemo(() => {
    if (!broadcastData) return new Map<string, string[]>();

    return broadcastData.reduce((acc, broadcast) => {
      const primary = getPrimaryPrefecture(broadcast.prefecture);
      const existing = acc.get(primary) ?? [];
      acc.set(primary, [...existing, broadcast.broadcastName]);
      return acc;
    }, new Map<string, string[]>());
  }, [broadcastData]);

  // アイコンをメモ化して不要なMarker再描画を防止
  const markerIcons = useMemo(() => {
    if (!officeData) return new Map<string, DivIcon>();

    const icons = new Map<string, DivIcon>();
    for (const office of officeData) {
      const broadcasts = broadcastsByPrefecture.get(office.name) ?? [];
      if (broadcasts.length > 0) {
        icons.set(office.code, createBroadcastLabelIcon(broadcasts));
      }
    }
    return icons;
  }, [officeData, broadcastsByPrefecture]);

  if (officesLoading || broadcastsLoading || officesError || broadcastsError || !officeData) {
    return null;
  }

  return (
    <>
      {officeData.map((office) => {
        const markerIcon = markerIcons.get(office.code);
        if (!markerIcon) return null;

        return <Marker key={office.code} position={[office.lat, office.lon]} icon={markerIcon} />;
      })}
    </>
  );
}

export const PrefectureOfficeMarkers = memo(PrefectureOfficeMarkersComponent);
