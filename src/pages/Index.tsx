import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { TrackCard } from "@/components/TrackCard";
import { AudioPlayer, QueueTrack } from "@/components/AudioPlayer";
import { useAudiusApi } from "@/hooks/useAudiusApi";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { likesAPI, recommendationsAPI } from "@/lib/api";
import { Loader2, TrendingUp, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonList } from "@/components/SkeletonCard";
import { MobileNav } from "@/components/MobileNav";

const AUDIUS_API_HOST = "https://discoveryprovider.audius.co";

const Index = () => {
  const { tracks, loading, error } = useAudiusApi();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = useState<{
    title: string;
    artist: string;
    imageUrl: string;
    audioUrl: string;
  } | null>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [queue, setQueue] = useState<QueueTrack[]>([]);
  const [newReleases, setNewReleases] = useState<typeof tracks>([]);
  const [loadingNew, setLoadingNew] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Load user's liked tracks
      const loadLikes = async () => {
        try {
          const likes = await likesAPI.getUserLikes();
          const likedIds = new Set<string>(likes.map((like: any) => like.track_id as string));
          setLikedTracks(likedIds);
        } catch (error) {
          console.error("Failed to load likes:", error);
        }
      };

      // Load favorite genres for recommendations
      const loadGenres = async () => {
        try {
          const genresData = await recommendationsAPI.getFavoriteGenres();
          setFavoriteGenres(genresData.map((g: any) => g.track_genre));
        } catch (error) {
          console.error("Failed to load genres:", error);
        }
      };

      loadLikes();
      loadGenres();
    }
  }, [isAuthenticated]);

  // Fetch new releases (underground tracks)
  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        setLoadingNew(true);
        const response = await fetch(
          `${AUDIUS_API_HOST}/v1/tracks/trending/underground?limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          const formatted = data.data?.map((track: any) => ({
            id: track.id,
            title: track.title,
            artist: track.user?.name || "Unknown",
            imageUrl: track.artwork?.["480x480"] || track.artwork?.["150x150"] || "/placeholder.svg",
            audioUrl: `${AUDIUS_API_HOST}/v1/tracks/${track.id}/stream`,
            duration: formatDuration(track.duration || 0),
            genre: track.genre || "Unknown",
          })) || [];
          setNewReleases(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch new releases:", error);
      } finally {
        setLoadingNew(false);
      }
    };
    fetchNewReleases();
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get recommended tracks based on favorite genres
  const recommendedTracks = useMemo(() => {
    if (favoriteGenres.length === 0 || tracks.length === 0) return [];
    return tracks.filter(track => 
      favoriteGenres.some(genre => 
        track.genre?.toLowerCase().includes(genre.toLowerCase())
      )
    ).slice(0, 10);
  }, [tracks, favoriteGenres]);

  const handlePlay = (track: typeof tracks[0]) => {
    setCurrentTrack({
      title: track.title,
      artist: track.artist,
      imageUrl: track.imageUrl,
      audioUrl: track.audioUrl,
    });

    // Track listening for recommendations (if authenticated)
    if (isAuthenticated) {
      recommendationsAPI
        .trackListen({
          track_id: track.id,
          track_title: track.title,
          track_artist: track.artist,
          track_image_url: track.imageUrl,
          track_audio_url: track.audioUrl,
          track_duration: track.duration,
          track_genre: track.genre,
        })
        .catch((err) => console.error("Failed to track listen:", err));
    }
  };

  const handleAddToQueue = (track: typeof tracks[0]) => {
    setQueue(prev => [...prev, {
      id: track.id,
      title: track.title,
      artist: track.artist,
      imageUrl: track.imageUrl,
      audioUrl: track.audioUrl,
    }]);
  };

  const handlePlayFromQueue = (index: number) => {
    const track = queue[index];
    if (track) {
      setCurrentTrack(track);
      setQueue(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleLike = async (track: typeof tracks[0]) => {
    if (!isAuthenticated) {
      toast.error(t("msg.loginRequired"));
      navigate("/login");
      return;
    }

    const isCurrentlyLiked = likedTracks.has(track.id);

    try {
      if (isCurrentlyLiked) {
        await likesAPI.unlikeTrack(track.id);
        setLikedTracks((prev) => {
          const newLiked = new Set(prev);
          newLiked.delete(track.id);
          return newLiked;
        });
        toast.success(t("msg.unliked"));
      } else {
        await likesAPI.likeTrack({
          track_id: track.id,
          track_title: track.title,
          track_artist: track.artist,
          track_image_url: track.imageUrl,
          track_audio_url: track.audioUrl,
          track_duration: track.duration,
          track_genre: track.genre,
        });
        setLikedTracks((prev) => {
          const newLiked = new Set(prev);
          newLiked.add(track.id);
          return newLiked;
        });
        toast.success(t("msg.liked"));
      }
    } catch (error) {
      toast.error(t("msg.error"));
    }
  };

  const handleNext = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlay(tracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.title === currentTrack.title);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    handlePlay(tracks[prevIndex]);
  };

  return (
    <div className="min-h-screen pb-32">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="max-w-screen-2xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
            {t("home.title").split(" ")[0]} <span className="gradient-text">{t("home.title").split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl animate-slide-up">
            {t("home.subtitle")}
          </p>
          {isAuthenticated && favoriteGenres.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("home.yourGenres")} :</span>
              {favoriteGenres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-primary/20 rounded-full text-sm font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {loading && <SkeletonList count={10} />}

          {!loading && !error && (
            <Tabs defaultValue="trending" className="w-full">
              <TabsList className="mb-6 bg-white/5">
                <TabsTrigger value="trending" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t("home.trendingTitle")}
                </TabsTrigger>
                <TabsTrigger value="new" className="gap-2">
                  <Clock className="w-4 h-4" />
                  {t("home.newReleases")}
                </TabsTrigger>
                {isAuthenticated && recommendedTracks.length > 0 && (
                  <TabsTrigger value="recommended" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t("home.recommendedForYou")}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="trending">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {tracks.map((track) => (
                    <div key={track.id} className="animate-slide-up">
                      <TrackCard
                        trackId={track.id}
                        artistId={track.artistId}
                        title={track.title}
                        artist={track.artist}
                        imageUrl={track.imageUrl}
                        audioUrl={track.audioUrl}
                        duration={track.duration}
                        genre={track.genre}
                        onPlay={() => handlePlay(track)}
                        onLike={() => handleLike(track)}
                        isLiked={likedTracks.has(track.id)}
                        showComments={true}
                        onAddToQueue={() => handleAddToQueue(track)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="new">
                {loadingNew ? (
                  <SkeletonList count={10} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {newReleases.map((track) => (
                      <div key={track.id} className="animate-slide-up">
                        <TrackCard
                          trackId={track.id}
                          title={track.title}
                          artist={track.artist}
                          imageUrl={track.imageUrl}
                          audioUrl={track.audioUrl}
                          duration={track.duration}
                          genre={track.genre}
                          onPlay={() => handlePlay(track)}
                          onLike={() => handleLike(track)}
                          isLiked={likedTracks.has(track.id)}
                          showComments={true}
                          onAddToQueue={() => handleAddToQueue(track)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {isAuthenticated && recommendedTracks.length > 0 && (
                <TabsContent value="recommended">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("home.basedOnLikes")}: {favoriteGenres.slice(0, 3).join(", ")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {recommendedTracks.map((track) => (
                      <div key={track.id} className="animate-slide-up">
                        <TrackCard
                          trackId={track.id}
                          title={track.title}
                          artist={track.artist}
                          imageUrl={track.imageUrl}
                          audioUrl={track.audioUrl}
                          duration={track.duration}
                          genre={track.genre}
                          onPlay={() => handlePlay(track)}
                          onLike={() => handleLike(track)}
                          isLiked={likedTracks.has(track.id)}
                          showComments={true}
                          onAddToQueue={() => handleAddToQueue(track)}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </section>

      {/* Audio Player */}
      <MobileNav />

      <AudioPlayer
        currentTrack={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onLike={() => {
          const track = tracks.find(t => t.title === currentTrack?.title);
          if (track) handleLike(track);
        }}
        isLiked={currentTrack ? likedTracks.has(tracks.find(t => t.title === currentTrack.title)?.id || "") : false}
        queue={queue}
        onQueueChange={setQueue}
        onPlayFromQueue={handlePlayFromQueue}
      />
    </div>
  );
};

export default Index;
