import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { TrackCard } from "@/components/TrackCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { playlistsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Music } from "lucide-react";
import { toast } from "sonner";

const PlaylistDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchTracks = async () => {
      try {
        const data = await playlistsAPI.getPlaylistTracks(Number(id));
        setTracks(data);
      } catch (error) {
        toast.error("Erreur lors du chargement de la playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [id, isAuthenticated, navigate]);

  const handlePlay = (track: any) => {
    setCurrentTrack({
      title: track.track_title,
      artist: track.track_artist,
      imageUrl: track.track_image_url,
      audioUrl: track.track_audio_url,
    });
  };

  const handleRemove = async (trackId: number) => {
    try {
      await playlistsAPI.removeTrackFromPlaylist(Number(id), trackId);
      setTracks(tracks.filter((t) => t.id !== trackId));
      toast.success("Musique retirée de la playlist");
    } catch (error) {
      toast.error("Erreur lors du retrait de la musique");
    }
  };

  const handleNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.track_title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlay(tracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.track_title === currentTrack.title);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    handlePlay(tracks[prevIndex]);
  };

  return (
    <div className="min-h-screen pb-32">
      <Navigation />
      
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-screen-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => navigate("/playlists")}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux playlists
          </Button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <Music className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h2 className="text-4xl font-bold">Playlist</h2>
              <p className="text-muted-foreground">
                {tracks.length} musique{tracks.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          )}

          {!loading && tracks.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">
                Aucune musique dans cette playlist
              </p>
            </div>
          )}

          {!loading && tracks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {tracks.map((track) => (
                <div key={track.id} className="animate-slide-up relative group">
                  <TrackCard
                    title={track.track_title}
                    artist={track.track_artist}
                    imageUrl={track.track_image_url}
                    duration={track.track_duration}
                    onPlay={() => handlePlay(track)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => handleRemove(track.id)}
                  >
                    Retirer
                  </Button>
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
      />
    </div>
  );
};

export default PlaylistDetail;
