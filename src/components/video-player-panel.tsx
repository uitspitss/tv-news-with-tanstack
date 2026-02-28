import { useEffect, useRef } from "react";
import { YouTubePlayer } from "@/components/youtube-player";
import { useVideoPlayer } from "@/contexts/video-player-context";

export function VideoPlayerPanel() {
  const { selectedBroadcast, closePlayer } = useVideoPlayer();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedBroadcast) {
      closeButtonRef.current?.focus();
    }
  }, [selectedBroadcast]);

  useEffect(() => {
    if (!selectedBroadcast) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePlayer();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedBroadcast, closePlayer]);

  if (!selectedBroadcast) return null;

  return (
    <div
      role="dialog"
      aria-label={`${selectedBroadcast.broadcastName} の動画プレイヤー`}
      className="fixed bottom-4 right-4 z-[1100] w-[min(480px,calc(100vw-32px))] overflow-hidden rounded-lg border border-white/10 bg-[#1c1c1c] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 py-1 px-2">
        <span className="truncate text-[13px] font-semibold text-[#eaeaea]">
          {selectedBroadcast.broadcastName}
        </span>
        <button
          ref={closeButtonRef}
          onClick={closePlayer}
          type="button"
          aria-label="動画プレイヤーを閉じる"
          className="ml-2 shrink-0 cursor-pointer border-none bg-transparent p-1 text-base leading-none text-[#eaeaea]/60 transition-colors hover:text-[#eaeaea]"
        >
          ✕
        </button>
      </div>
      <div className="aspect-4/3">
        <YouTubePlayer playlistId={selectedBroadcast.playlistId} />
      </div>
    </div>
  );
}
