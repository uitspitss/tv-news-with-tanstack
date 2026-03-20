export function MapLoadingIndicator() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="地図を読み込んでいます"
      className="map-loading"
    >
      <div className="loading-pulse" />
      <p className="loading-text">Loading Map</p>
    </div>
  );
}
