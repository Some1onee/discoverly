import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { TrackCard } from "@/components/TrackCard";
import { AudioPlayer, QueueTrack } from "@/components/AudioPlayer";
import { MobileNav } from "@/components/MobileNav";
import { SkeletonList } from "@/components/SkeletonCard";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { likesAPI, recommendationsAPI } from "@/lib/api";
import { Loader2, Users, Play, Share2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AUDIUS_API_HOST = "https://discoveryprovider.audius.co";

interface Track {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  duration: string;
  genre?: string;
}

interface ArtistData {
  id: string;
  name: string;
  handle: string;
  bio: string;
  profile_picture: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
  cover_photo: {
    "640x"?: string;
    "2000x"?: string;
  };
  follower_count: number;
  track_count: number;
}

const Artist = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<QueueTrack[]>([]);

  useEffect(() => {
    if (artistId) {
      fetchArtist();
      fetchArtistTracks();
    }
    if (isAuthenticated) {
      loadLikes();
    }
  }, [artistId, isAuthenticated]);

  const fetchArtist = async () => {
    try {
      const response = await fetch(`${AUDIUS_API_HOST}/v1/users/${artistId}`);
      if (response.ok) {
        const data = await response.json();
        setArtist(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch artist:", error);
    }
  };

  const fetchArtistTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${AUDIUS_API_HOST}/v1/users/${artistId}/tracks?limit=50`
      );
      if (response.ok) {
        const data = await response.json();
        const formattedTracks: Track[] = data.data.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: track.user?.name || "Unknown",
          imageUrl: track.artwork?.["480x480"] || track.artwork?.["150x150"] || "/placeholder.svg",
          audioUrl: `${AUDIUS_API_HOST}/v1/tracks/${track.id}/stream`,
          duration: formatDuration(track.duration || 0),
          genre: track.genre || "Unknown",
        }));
        setTracks(formattedTracks);
      }
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
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

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlay = (track: Track) => {
    setCurrentTrack({
      title: track.title,
      artist: track.artist,
      imageUrl: track.imageUrl,
      audioUrl: track.audioUrl,
    });

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

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      handlePlay(tracks[0]);
      setQueue(tracks.slice(1).map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        imageUrl: t.imageUrl,
        audioUrl: t.audioUrl,
      })));
    }
  };

  const handleLike = async (track: Track) => {
    if (!isAuthenticated) {
      toast.error(t("msg.loginRequired"));
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

  const handleAddToQueue = (track: Track) => {
    setQueue(prev => [...prev, {
      id: track.id,
      title: track.title,
      artist: track.artist,
      imageUrl: track.imageUrl,
      audioUrl: track.audioUrl,
    }]);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlay(tracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.title === currentTrack.title);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    handlePlay(tracks[prevIndex]);
  };

  return (
    <div className="min-h-screen pb-32">
      <Navigation />

      {/* Artist Header */}
      {artist && (
        <section className="pt-20 relative overflow-hidden animate-fade-in">
          {/* Cover Photo */}
          <div
            className="absolute inset-0 h-80 bg-cover bg-center"
            style={{
              backgroundImage: artist.cover_photo?.["2000x"]
                ? `url(${artist.cover_photo["2000x"]})`
                : "var(--gradient-glow)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          </div>

          <div className="relative z-10 max-w-screen-2xl mx-auto px-6 pt-20 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <img
                src={artist.profile_picture?.["480x480"] || artist.profile_picture?.["150x150"] || "/placeholder.svg"}
                alt={artist.name}
                className="w-48 h-48 rounded-full object-cover border-4 border-background shadow-2xl"
              />
              <div className="text-center md:text-left flex-1">
                <p className="text-sm text-muted-foreground mb-1">Artist</p>
                <h1 className="text-4xl md:text-6xl font-bold mb-2">{artist.name}</h1>
                <p className="text-muted-foreground mb-4">@{artist.handle}</p>
                <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{artist.follower_count?.toLocaleString() || 0} followers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>{artist.track_count || tracks.length} tracks</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="lg" onClick={handlePlayAll} className="gap-2">
                  <Play className="w-5 h-5" fill="currentColor" />
                  Play All
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {artist.bio && (
              <p className="mt-6 text-muted-foreground max-w-3xl line-clamp-3">
                {artist.bio}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Tracks */}
      <section className="px-6 py-8">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Discography</h2>

          {loading ? (
            <SkeletonList count={10} />
          ) : tracks.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">No tracks found</p>
              <p className="text-muted-foreground">
                This artist hasn't released any tracks yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
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
        </div>
      </section>

      <MobileNav />

      <AudioPlayer
        currentTrack={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onLike={() => {
          const track = tracks.find((t) => t.title === currentTrack?.title);
          if (track) handleLike(track);
        }}
        isLiked={
          currentTrack
            ? likedTracks.has(tracks.find((t) => t.title === currentTrack.title)?.id || "")
            : false
        }
        queue={queue}
        onQueueChange={setQueue}
        onPlayFromQueue={(index) => {
          const track = queue[index];
          if (track) {
            setCurrentTrack(track);
            setQueue(prev => prev.filter((_, i) => i !== index));
          }
        }}
      />
    </div>
  );
};

export default Artist;
