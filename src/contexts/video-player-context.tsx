import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Broadcast } from "@/types/broadcast";

interface VideoPlayerContextValue {
  selectedBroadcast: Broadcast | null;
  openPlayer: (broadcast: Broadcast) => void;
  closePlayer: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

  const openPlayer = useCallback((broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast);
  }, []);

  const closePlayer = useCallback(() => {
    setSelectedBroadcast(null);
  }, []);

  const value = useMemo(
    () => ({ selectedBroadcast, openPlayer, closePlayer }),
    [selectedBroadcast, openPlayer, closePlayer],
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
