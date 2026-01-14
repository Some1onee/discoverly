import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { TrackCard } from "@/components/TrackCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { likesAPI, localHistoryAPI } from "@/lib/api";
import { History as HistoryIcon, Clock, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface HistoryTrack {
  id: number;
  track_id: string;
  track_genre: string;
  listened_at: string;
  track_title?: string;
  track_artist?: string;
  track_image_url?: string;
  track_audio_url?: string;
  track_duration?: string;
}

const AUDIUS_API_HOST = "https://discoveryprovider.audius.co";

const History = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadHistory();
    loadLikes();
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // Load from localStorage
      const localHistory = localHistoryAPI.getHistory();
      setHistory(localHistory);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLikes = async () => {
    try {
      const likes = await likesAPI.getUserLikes();
      const likedIds = new Set<string>(likes.map((like: any) => like.track_id as string));
      setLikedTracks(likedIds);
    } catch (error) {
      console.error("Failed to load likes:", error);
    }
  };

  const handlePlay = (track: HistoryTrack) => {
    if (!track.track_audio_url) {
      // Fetch track details from Audius if not available
      setCurrentTrack({
        title: track.track_title || "Unknown",
        artist: track.track_artist || "Unknown",
        imageUrl: track.track_image_url || "/placeholder.svg",
        audioUrl: `${AUDIUS_API_HOST}/v1/tracks/${track.track_id}/stream`,
      });
    } else {
      setCurrentTrack({
        title: track.track_title,
        artist: track.track_artist,
        imageUrl: track.track_image_url,
        audioUrl: track.track_audio_url,
      });
    }
  };

  const handleLike = async (track: HistoryTrack) => {
    const isCurrentlyLiked = likedTracks.has(track.track_id);

    try {
      if (isCurrentlyLiked) {
        await likesAPI.unlikeTrack(track.track_id);
        setLikedTracks((prev) => {
          const newLiked = new Set(prev);
          newLiked.delete(track.track_id);
          return newLiked;
        });
        toast.success(t("msg.unliked"));
      } else {
        await likesAPI.likeTrack({
          track_id: track.track_id,
          track_title: track.track_title,
          track_artist: track.track_artist,
          track_image_url: track.track_image_url,
          track_audio_url: track.track_audio_url || `${AUDIUS_API_HOST}/v1/tracks/${track.track_id}/stream`,
          track_duration: track.track_duration,
          track_genre: track.track_genre,
        });
        setLikedTracks((prev) => {
          const newLiked = new Set(prev);
          newLiked.add(track.track_id);
          return newLiked;
        });
        toast.success(t("msg.liked"));
      }
    } catch (error) {
      toast.error(t("msg.error"));
    }
  };

  const clearHistory = () => {
    localHistoryAPI.clearHistory();
    setHistory([]);
    toast.success("History cleared");
  };

  const groupHistoryByDate = (history: HistoryTrack[]) => {
    const groups: { [key: string]: HistoryTrack[] } = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    history.forEach((track) => {
      const date = new Date(track.listened_at);
      let key: string;

      if (date.toDateString() === today.toDateString()) {
        key = t("history.today");
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = t("history.yesterday");
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        key = t("history.thisWeek");
      } else {
        key = t("history.earlier");
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(track);
    });

    return groups;
  };

  const groupedHistory = groupHistoryByDate(history);

  return (
    <div className="min-h-screen pb-32">
      <Navigation />

      <section className="pt-24 pb-12 px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <HistoryIcon className="w-10 h-10 text-primary" />
                {t("history.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("history.subtitle")}
              </p>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                onClick={clearHistory}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t("history.clear")}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">{t("history.empty")}</p>
              <p className="text-muted-foreground">
                {t("history.emptyDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedHistory).map(([date, tracks]) => (
                <div key={date}>
                  <h3 className="text-xl font-semibold mb-4 text-muted-foreground">
                    {date}
                  </h3>
                  <div className="glass-card divide-y divide-white/5">
                    {tracks.map((track, index) => (
                      <div key={`${track.id}-${index}`} className="p-2">
                        <TrackCard
                          trackId={track.track_id}
                          title={track.track_title || "Unknown Track"}
                          artist={track.track_artist || "Unknown Artist"}
                          imageUrl={track.track_image_url || "/placeholder.svg"}
                          audioUrl={track.track_audio_url}
                          duration={track.track_duration}
                          genre={track.track_genre}
                          onPlay={() => handlePlay(track)}
                          onLike={() => handleLike(track)}
                          isLiked={likedTracks.has(track.track_id)}
                          compact={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AudioPlayer
        currentTrack={currentTrack}
        onLike={() => {
          const track = history.find((t) => t.track_title === currentTrack?.title);
          if (track) handleLike(track);
        }}
        isLiked={
          currentTrack
            ? likedTracks.has(history.find((t) => t.track_title === currentTrack.title)?.track_id || "")
            : false
        }
      />
    </div>
  );
};

export default History;
