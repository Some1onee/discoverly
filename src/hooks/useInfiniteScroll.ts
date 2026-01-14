import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<T[]>;
  initialData?: T[];
  pageSize?: number;
}

export const useInfiniteScroll = <T>({
  fetchFn,
  initialData = [],
  pageSize = 20,
}: UseInfiniteScrollOptions<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newData = await fetchFn(page);
      
      if (newData.length < pageSize) {
        setHasMore(false);
      }

      setData((prev) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, loading, hasMore, pageSize]);

  const setLoadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
              loadMore();
            }
          },
          { rootMargin: "200px", threshold: 0.1 }
        );
        observerRef.current.observe(node);
        loadMoreRef.current = node;
      }
    },
    [loadMore, hasMore, loading]
  );

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMoreRef: setLoadMoreRef,
    reset,
    setData,
  };
};
