import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_VOLUME = 50;

interface YouTubePlayerProps {
  playlistId: string;
}

declare global {
  interface Window {
    YT: { Player: new (el: HTMLElement, options?: YT.PlayerOptions) => YT.Player };
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const check = () => {
        if (window.YT?.Player) resolve();
        else setTimeout(check, 50);
      };
      check();
      return;
    }

    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
}

export function YouTubePlayer({ playlistId }: Readonly<YouTubePlayerProps>) {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const prevPlaylistId = useRef(playlistId);

  if (prevPlaylistId.current !== playlistId) {
    prevPlaylistId.current = playlistId;
    setLoading(true);
  }

  const initPlayer = useCallback((targetPlaylistId: string) => {
    if (!containerRef.current) return;

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // コンテナ内の既存要素をクリアしてプレイヤー用divを追加
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    const el = document.createElement("div");
    containerRef.current.appendChild(el);

    playerRef.current = new window.YT.Player(el, {
      width: "100%",
      height: "100%",
      playerVars: {
        listType: "playlist",
        list: targetPlaylistId,
        autoplay: 1,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          event.target.setVolume(DEFAULT_VOLUME);
          setLoading(false);
        },
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeAPI().then(() => {
      if (!cancelled) {
        initPlayer(playlistId);
      }
    });

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [playlistId, initPlayer]);

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1c1c1c]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
