interface MapErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  showDetails?: boolean;
}

export function MapErrorFallback({
  error,
  onRetry,
  showDetails = import.meta.env.DEV,
}: MapErrorFallbackProps) {
  return (
    <div className="error-container">
      <div className="error-card" role="alert">
        <svg
          className="error-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>

        <h2 className="error-title">地図データの読み込みに失敗しました</h2>
        <p className="error-message">ネットワーク接続を確認して、再度お試しください。</p>

        {showDetails && (
          <details className="error-details">
            <summary>エラーの詳細</summary>
            <pre>{error.message}</pre>
          </details>
        )}

        {onRetry && (
          <button onClick={onRetry} type="button" className="error-retry-btn">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            再試行
          </button>
        )}
      </div>
    </div>
  );
}
