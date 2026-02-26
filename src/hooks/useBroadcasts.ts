import { useCallback, useEffect, useState } from "react";

interface Broadcast {
  prefecture: string;
  broadcastName: string;
  playlistURL: string;
  playlistId: string;
}

interface UseBroadcastsReturn {
  data: Broadcast[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useBroadcasts(): UseBroadcastsReturn {
  const [data, setData] = useState<Broadcast[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/data/broadcasts.json");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch broadcast data: ${response.status} ${response.statusText}`,
        );
      }

      const json = await response.json();

      if (!Array.isArray(json)) {
        throw new Error("Invalid broadcast data format");
      }

      setData(json as Broadcast[]);
      setIsLoading(false);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error("Unknown error occurred");
      console.error("Failed to load broadcast data:", fetchError);

      if (retryCount === 0) {
        setRetryCount(1);
        setTimeout(() => {
          fetchData();
        }, 1000);
        return;
      }

      setError(fetchError);
      setIsLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error };
}
