import { useEffect, useRef } from "react";

interface Track {
  audioUrl: string;
}

export const usePrefetch = (
  currentTrack: Track | null,
  queue: Track[],
  enabled: boolean = true
) => {
  const prefetchedUrls = useRef<Set<string>>(new Set());
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    if (!enabled || queue.length === 0) return;

    // Prefetch next 2 tracks in queue
    const tracksToPreload = queue.slice(0, 2);

    tracksToPreload.forEach((track) => {
      if (prefetchedUrls.current.has(track.audioUrl)) return;

      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = track.audioUrl;
      
      // Just load metadata, don't buffer entire file
      audio.load();

      prefetchedUrls.current.add(track.audioUrl);
      audioCache.current.set(track.audioUrl, audio);

      // Clean up old cached audio elements (keep max 5)
      if (audioCache.current.size > 5) {
        const firstKey = audioCache.current.keys().next().value;
        if (firstKey) {
          audioCache.current.delete(firstKey);
          prefetchedUrls.current.delete(firstKey);
        }
      }
    });
  }, [queue, enabled]);

  // Prefetch images
  useEffect(() => {
    if (!enabled) return;

    queue.slice(0, 3).forEach((track: any) => {
      if (track.imageUrl && !track.imageUrl.includes("placeholder")) {
        const img = new Image();
        img.src = track.imageUrl;
      }
    });
  }, [queue, enabled]);

  return {
    isPrefetched: (url: string) => prefetchedUrls.current.has(url),
    getCachedAudio: (url: string) => audioCache.current.get(url),
  };
};
