import type { DivIcon } from "leaflet";
import { divIcon } from "leaflet";
import { memo, useCallback, useMemo } from "react";
import { Marker } from "react-leaflet";
import { useVideoPlayer } from "@/contexts/video-player-context";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { usePrefectureOffices } from "@/hooks/usePrefectureOffices";
import type { Broadcast } from "@/types/broadcast";

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

function createBroadcastLabelIcon(broadcasts: Broadcast[]) {
  const LINE_HEIGHT = 17;
  const height = Math.max(broadcasts.length * LINE_HEIGHT, LINE_HEIGHT);
  const linesHtml = broadcasts
    .map(
      (b) =>
        `<div class="broadcast-name" data-broadcast-name="${escapeHtml(b.broadcastName)}">${escapeHtml(b.broadcastName)}</div>`,
    )
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
  const { openPlayer } = useVideoPlayer();

  const broadcastsByPrefecture = useMemo(() => {
    if (!broadcastData) return new Map<string, Broadcast[]>();

    return broadcastData.reduce((acc, broadcast) => {
      const primary = getPrimaryPrefecture(broadcast.prefecture);
      const existing = acc.get(primary) ?? [];
      acc.set(primary, [...existing, broadcast]);
      return acc;
    }, new Map<string, Broadcast[]>());
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

  const handleMarkerClick = useCallback(
    (e: L.LeafletMouseEvent, prefectureName: string) => {
      const target = e.originalEvent.target as HTMLElement;
      const nameEl = target.closest<HTMLElement>("[data-broadcast-name]");
      if (!nameEl) return;

      const broadcastName = nameEl.dataset.broadcastName;
      if (!broadcastName) return;

      const broadcasts = broadcastsByPrefecture.get(prefectureName) ?? [];
      const broadcast = broadcasts.find((b) => b.broadcastName === broadcastName);
      if (broadcast) {
        openPlayer(broadcast);
      }
    },
    [broadcastsByPrefecture, openPlayer],
  );

  if (officesLoading || broadcastsLoading || officesError || broadcastsError || !officeData) {
    return null;
  }

  return (
    <>
      {officeData.map((office) => {
        const markerIcon = markerIcons.get(office.code);
        if (!markerIcon) return null;

        return (
          <Marker
            key={office.code}
            position={[office.lat, office.lon]}
            icon={markerIcon}
            eventHandlers={{
              click: (e) => handleMarkerClick(e, office.name),
            }}
          />
        );
      })}
    </>
  );
}

export const PrefectureOfficeMarkers = memo(PrefectureOfficeMarkersComponent);
