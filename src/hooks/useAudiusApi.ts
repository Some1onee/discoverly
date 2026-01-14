import { useState, useEffect } from "react";

const AUDIUS_API_HOST = "https://discoveryprovider.audius.co";

interface AudiusTrack {
  id: string;
  title: string;
  user: {
    id: string;
    name: string;
  };
  artwork: {
    "150x150": string;
    "480x480": string;
  };
  duration: number;
  genre?: string;
  mood?: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  imageUrl: string;
  audioUrl: string;
  duration: string;
  genre?: string;
}

export const useAudiusApi = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingTracks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${AUDIUS_API_HOST}/v1/tracks/trending?limit=20`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch tracks from Audius");
        }

        const data = await response.json();
        
        const formattedTracks: Track[] = data.data.map((track: AudiusTrack) => ({
          id: track.id,
          title: track.title,
          artist: track.user.name,
          artistId: track.user.id,
          imageUrl: track.artwork?.["480x480"] || track.artwork?.["150x150"] || "/placeholder.svg",
          audioUrl: `${AUDIUS_API_HOST}/v1/tracks/${track.id}/stream`,
          duration: formatDuration(track.duration),
          genre: track.genre || track.mood || "Unknown",
        }));

        setTracks(formattedTracks);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Audius API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTracks();
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return { tracks, loading, error };
};
