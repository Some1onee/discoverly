import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { TrackCard } from "@/components/TrackCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { likesAPI } from "@/lib/api";
import { Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Liked = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [likedTracks, setLikedTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchLikedTracks = async () => {
      try {
        const tracks = await likesAPI.getUserLikes();
        setLikedTracks(tracks);
      } catch (error) {
        toast.error(t("msg.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchLikedTracks();
  }, [isAuthenticated, navigate]);

  const handlePlay = (track: any) => {
    setCurrentTrack({
      title: track.track_title,
      artist: track.track_artist,
      imageUrl: track.track_image_url,
      audioUrl: track.track_audio_url,
    });
  };

  const handleUnlike = async (trackId: string) => {
    try {
      await likesAPI.unlikeTrack(trackId);
      setLikedTracks(likedTracks.filter((t) => t.track_id !== trackId));
      toast.success(t("msg.unliked"));
    } catch (error) {
      toast.error(t("msg.error"));
    }
  };

  const handleNext = () => {
    if (!currentTrack || likedTracks.length === 0) return;
    const currentIndex = likedTracks.findIndex((t) => t.track_title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % likedTracks.length;
    handlePlay(likedTracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentTrack || likedTracks.length === 0) return;
    const currentIndex = likedTracks.findIndex((t) => t.track_title === currentTrack.title);
    const prevIndex = currentIndex === 0 ? likedTracks.length - 1 : currentIndex - 1;
    handlePlay(likedTracks[prevIndex]);
  };

  return (
    <div className="min-h-screen pb-32">
      <Navigation />
      
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-4xl font-bold mb-2">
              <Heart className="w-10 h-10 inline-block mr-3 text-accent" />
              {t("likes.title")}
            </h2>
            <p className="text-muted-foreground">{t("likes.subtitle")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {likedTracks.length} {likedTracks.length > 1 ? t("likes.countPlural") : t("likes.count")}
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          )}

          {!loading && likedTracks.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-xl text-muted-foreground">{t("likes.empty")}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("likes.emptyDesc")}
              </p>
            </div>
          )}

          {!loading && likedTracks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {likedTracks.map((track) => (
                <div key={track.id} className="animate-slide-up">
                  <TrackCard
                    title={track.track_title}
                    artist={track.track_artist}
                    imageUrl={track.track_image_url}
                    duration={track.track_duration}
                    onPlay={() => handlePlay(track)}
                    onLike={() => handleUnlike(track.track_id)}
                    isLiked={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AudioPlayer
        currentTrack={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onLike={() => currentTrack && handleUnlike(likedTracks.find(t => t.track_title === currentTrack.title)?.track_id)}
        isLiked={true}
      />
    </div>
  );
};

export default Liked;
