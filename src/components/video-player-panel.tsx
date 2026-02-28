import { useCallback, useEffect, useRef, useState } from "react";
import type { RndResizeCallback } from "react-rnd";
import { Rnd } from "react-rnd";
import { YouTubePlayer } from "@/components/youtube-player";
import { useVideoPlayer } from "@/contexts/video-player-context";

const ASPECT_RATIO = 4 / 3;
const HEADER_HEIGHT = 33;
const MIN_WIDTH = 240;
const DEFAULT_WIDTH = 480;
const PADDING = 16;

function computeMaxWidth() {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const fromWidth = window.innerWidth * 0.8;
  const fromHeight = (window.innerHeight - PADDING * 2 - HEADER_HEIGHT) * ASPECT_RATIO;
  return Math.min(fromWidth, fromHeight);
}

function clampBounds(prev: { x: number; y: number; width: number }) {
  const maxWidth = computeMaxWidth();
  const width = Math.max(MIN_WIDTH, Math.min(prev.width, maxWidth));
  const totalH = width / ASPECT_RATIO + HEADER_HEIGHT;
  return {
    width,
    x: Math.max(0, Math.min(prev.x, window.innerWidth - width)),
    y: Math.max(0, Math.min(prev.y, window.innerHeight - totalH)),
  };
}

function computeInitialBounds() {
  const maxWidth = computeMaxWidth();
  const width = Math.min(DEFAULT_WIDTH, maxWidth, window.innerWidth - PADDING * 2);
  const totalHeight = width / ASPECT_RATIO + HEADER_HEIGHT;
  return {
    x: window.innerWidth - width - PADDING,
    y: window.innerHeight - totalHeight - PADDING * 3,
    width,
  };
}

export function VideoPlayerPanel() {
  const { selectedBroadcast, selectedIndex, closePlayer, updateIndex } = useVideoPlayer();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [bounds, setBounds] = useState(computeInitialBounds);
  const [isInteracting, setIsInteracting] = useState(false);

  const prevBroadcastIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedBroadcast && prevBroadcastIdRef.current !== selectedBroadcast.id) {
      prevBroadcastIdRef.current = selectedBroadcast.id;
      setBounds(computeInitialBounds());
    }
    if (!selectedBroadcast) {
      prevBroadcastIdRef.current = null;
    }
  }, [selectedBroadcast]);

  useEffect(() => {
    const handleWindowResize = () => setBounds((prev) => clampBounds(prev));
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  useEffect(() => {
    if (selectedBroadcast) {
      closeButtonRef.current?.focus();
    }
  }, [selectedBroadcast]);

  useEffect(() => {
    if (!selectedBroadcast) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePlayer();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedBroadcast, closePlayer]);

  const handleResizeStop: RndResizeCallback = useCallback((_e, _dir, ref, _delta, position) => {
    setIsInteracting(false);
    const maxWidth = computeMaxWidth();
    setBounds({
      x: position.x,
      y: position.y,
      width: Math.max(MIN_WIDTH, Math.min(ref.offsetWidth, maxWidth)),
    });
  }, []);

  if (!selectedBroadcast) return null;

  const totalHeight = bounds.width / ASPECT_RATIO + HEADER_HEIGHT;

  return (
    <Rnd
      position={{ x: bounds.x, y: bounds.y }}
      size={{ width: bounds.width, height: totalHeight }}
      lockAspectRatio={ASPECT_RATIO}
      lockAspectRatioExtraHeight={HEADER_HEIGHT}
      minWidth={MIN_WIDTH}
      maxWidth={computeMaxWidth()}
      enableResizing={{
        top: false,
        bottom: false,
        left: true,
        right: true,
        topLeft: true,
        topRight: true,
        bottomLeft: true,
        bottomRight: true,
      }}
      dragHandleClassName="drag-handle"
      onDragStart={() => setIsInteracting(true)}
      onDragStop={(_e, d) => {
        setIsInteracting(false);
        setBounds((prev) => ({ ...prev, x: d.x, y: d.y }));
      }}
      onResizeStart={() => setIsInteracting(true)}
      onResizeStop={handleResizeStop}
      bounds="window"
      style={{ zIndex: 1100 }}
      className="overflow-hidden rounded-lg border border-white/10 bg-[#1c1c1c] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      role="dialog"
      aria-label={`${selectedBroadcast.broadcastName} の動画プレイヤー`}
    >
      <div className="drag-handle flex cursor-grab items-center justify-between border-b border-white/10 py-1 px-2 select-none active:cursor-grabbing">
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
            onMouseDown={(e) => e.stopPropagation()}
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
          onMouseDown={(e) => e.stopPropagation()}
          className="ml-2 shrink-0 cursor-pointer border-none bg-transparent p-1 text-base leading-none text-[#eaeaea]/60 transition-colors hover:text-[#eaeaea]"
        >
          ✕
        </button>
      </div>
      <div
        style={{
          height: bounds.width / ASPECT_RATIO,
          pointerEvents: isInteracting ? "none" : "auto",
        }}
      >
        <YouTubePlayer
          playlistId={selectedBroadcast.playlistId}
          index={selectedIndex}
          onIndexChange={updateIndex}
        />
      </div>
    </Rnd>
  );
}
