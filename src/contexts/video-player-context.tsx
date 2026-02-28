import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import type { Broadcast } from "@/types/broadcast";

interface VideoPlayerContextValue {
  selectedBroadcast: Broadcast | null;
  selectedIndex: number | undefined;
  openPlayer: (broadcast: Broadcast, index?: number) => void;
  closePlayer: () => void;
  updateIndex: (index: number) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const { broadcast: broadcastId, index } = useSearch({ from: "/" });
  const navigate = useNavigate();
  const { data: broadcasts } = useBroadcasts();

  const selectedBroadcast = useMemo(
    () =>
      broadcastId && broadcasts ? (broadcasts.find((b) => b.id === broadcastId) ?? null) : null,
    [broadcasts, broadcastId],
  );

  const openPlayer = useCallback(
    (broadcast: Broadcast, playerIndex?: number) => {
      const isSameBroadcast = broadcast.id === broadcastId;
      navigate({
        to: "/",
        search: isSameBroadcast
          ? { broadcast: broadcast.id, index: playerIndex ?? index }
          : { broadcast: broadcast.id, index: playerIndex },
      });
    },
    [navigate, broadcastId, index],
  );

  const closePlayer = useCallback(() => {
    navigate({ to: "/", search: {} });
  }, [navigate]);

  const updateIndex = useCallback(
    (newIndex: number) => {
      if (!broadcastId) return;
      navigate({
        to: "/",
        search: { broadcast: broadcastId, index: newIndex },
        replace: true,
      });
    },
    [navigate, broadcastId],
  );

  const value = useMemo(
    () => ({ selectedBroadcast, selectedIndex: index, openPlayer, closePlayer, updateIndex }),
    [selectedBroadcast, index, openPlayer, closePlayer, updateIndex],
  );

  return <VideoPlayerContext.Provider value={value}>{children}</VideoPlayerContext.Provider>;
}

export function useVideoPlayer(): VideoPlayerContextValue {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
  }
  return context;
}
