import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_VOLUME = 50;

interface YouTubePlayerProps {
  playlistId: string;
  index?: number;
  onIndexChange?: (index: number) => void;
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

export function YouTubePlayer({ playlistId, index, onIndexChange }: Readonly<YouTubePlayerProps>) {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const prevPlaylistId = useRef(playlistId);
  const lastReportedIndex = useRef<number | undefined>(index);
  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;
  const skipNextIndexSyncRef = useRef(false);

  if (prevPlaylistId.current !== playlistId) {
    prevPlaylistId.current = playlistId;
    lastReportedIndex.current = index;
    setLoading(true);
  }

  const initPlayer = useCallback((targetPlaylistId: string, targetIndex?: number) => {
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

    skipNextIndexSyncRef.current = true;
    playerRef.current = new window.YT.Player(el, {
      width: "100%",
      height: "100%",
      playerVars: {
        listType: "playlist",
        list: targetPlaylistId,
        autoplay: 1,
        ...(targetIndex != null && { index: targetIndex }),
      } as YT.PlayerVars,
      events: {
        onReady: (event: YT.PlayerEvent) => {
          event.target.setVolume(DEFAULT_VOLUME);
          setLoading(false);
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            const currentIndex = event.target.getPlaylistIndex();
            if (skipNextIndexSyncRef.current) {
              skipNextIndexSyncRef.current = false;
              lastReportedIndex.current = currentIndex;
              return;
            }
            if (currentIndex !== lastReportedIndex.current) {
              lastReportedIndex.current = currentIndex;
              onIndexChangeRef.current?.(currentIndex);
            }
          }
        },
      },
    });
  }, []);

  // プレイヤー初期化: playlistId が変わった時のみ再作成
  useEffect(() => {
    let cancelled = false;
    const initialIndex = lastReportedIndex.current;

    loadYouTubeAPI().then(() => {
      if (!cancelled) {
        initPlayer(playlistId, initialIndex);
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

  // 外部からの index 変更時は playVideoAt で対応（プレイヤーを再作成しない）
  useEffect(() => {
    if (index == null || !playerRef.current) return;
    if (index === lastReportedIndex.current) return;
    lastReportedIndex.current = index;
    playerRef.current.playVideoAt(index);
  }, [index]);

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
