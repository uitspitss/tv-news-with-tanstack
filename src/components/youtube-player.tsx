interface YouTubePlayerProps {
  playlistId: string;
}

export function YouTubePlayer({ playlistId }: Readonly<YouTubePlayerProps>) {
  return (
    <iframe
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="YouTube playlist player"
      className="border-none"
    />
  );
}
