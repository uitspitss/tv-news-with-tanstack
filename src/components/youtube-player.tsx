import { useCallback, useRef, useState } from "react";

interface YouTubePlayerProps {
  playlistId: string;
}

export function YouTubePlayer({ playlistId }: Readonly<YouTubePlayerProps>) {
  const [loading, setLoading] = useState(true);
  const prevPlaylistId = useRef(playlistId);

  if (prevPlaylistId.current !== playlistId) {
    prevPlaylistId.current = playlistId;
    setLoading(true);
  }

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1c1c1c]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        </div>
      )}
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube playlist player"
        className="border-none"
        onLoad={handleLoad}
      />
    </div>
  );
}
