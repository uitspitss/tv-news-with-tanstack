import { useEffect, useRef } from "react";
import { YouTubePlayer } from "@/components/youtube-player";
import { useVideoPlayer } from "@/contexts/video-player-context";

export function VideoPlayerPanel() {
  const { selectedBroadcast, selectedIndex, closePlayer, updateIndex } = useVideoPlayer();
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
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold text-[#eaeaea]">
            {selectedBroadcast.broadcastName}
          </span>
          <a
            href={selectedBroadcast.channelURL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${selectedBroadcast.broadcastName} のYouTubeチャンネルを開く`}
            className="shrink-0 text-[#eaeaea]/60 transition-colors hover:text-[#ff0000]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.54 15.51V8.49L15.82 12l-6.28 3.51z" />
            </svg>
            <span className="sr-only">
              {selectedBroadcast.broadcastName} のYouTubeチャンネルを開く
            </span>
          </a>
        </div>
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
        <YouTubePlayer
          playlistId={selectedBroadcast.playlistId}
          index={selectedIndex}
          onIndexChange={updateIndex}
        />
      </div>
    </div>
  );
}
