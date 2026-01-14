import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { commentsAPI, sharesAPI, likesAPI, playlistsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Heart, Share2, MessageCircle, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TrackDetail = () => {
  const { trackId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);

  // Get track info from URL state
  const location = window.history.state?.usr;
  const track = location?.track;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commentsData = await commentsAPI.getTrackComments(trackId!);
        setComments(commentsData);

        if (isAuthenticated) {
          const likeStatus = await likesAPI.checkLike(trackId!);
          setIsLiked(likeStatus.isLiked);

          const playlistsData = await playlistsAPI.getUserPlaylists();
          setPlaylists(playlistsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trackId, isAuthenticated]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour commenter");
      navigate("/login");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const comment = await commentsAPI.addComment(trackId!, newComment);
      setComments([comment, ...comments]);
      setNewComment("");
      toast.success("Commentaire ajouté !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout du commentaire");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentsAPI.deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success("Commentaire supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté");
      navigate("/login");
      return;
    }

    try {
      if (isLiked) {
        await likesAPI.unlikeTrack(trackId!);
        setIsLiked(false);
        toast.success("Retiré des favoris");
      } else {
        await likesAPI.likeTrack({
          track_id: trackId,
          track_title: track?.title || "Unknown",
          track_artist: track?.artist || "Unknown",
          track_image_url: track?.imageUrl,
          track_audio_url: track?.audioUrl,
          track_duration: track?.duration,
          track_genre: track?.genre,
        });
        setIsLiked(true);
        toast.success("Ajouté aux favoris !");
      }
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const handleShare = async () => {
    try {
      const shareData = await sharesAPI.createShareLink(
        trackId!,
        track?.title || "Unknown",
        track?.artist || "Unknown"
      );
      
      await navigator.clipboard.writeText(shareData.share_url);
      toast.success("Lien de partage copié !");
    } catch (error) {
      toast.error("Erreur lors du partage");
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    try {
      await playlistsAPI.addTrackToPlaylist(playlistId, {
        track_id: trackId,
        track_title: track?.title || "Unknown",
        track_artist: track?.artist || "Unknown",
        track_image_url: track?.imageUrl,
        track_audio_url: track?.audioUrl,
        track_duration: track?.duration,
        track_genre: track?.genre,
      });
      setPlaylistDialogOpen(false);
      toast.success("Ajouté à la playlist !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Track not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <Navigation />
      
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          {/* Track Info */}
          <div className="glass-card p-8 mb-8">
            <div className="flex gap-6 items-start mb-6">
              <img
                src={track.imageUrl}
                alt={track.title}
                className="w-48 h-48 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{track.title}</h1>
                <p className="text-xl text-muted-foreground mb-6">{track.artist}</p>
                
                <div className="flex gap-2">
                  <Button onClick={handleLike} className="gap-2">
                    <Heart className={isLiked ? "fill-current" : ""} />
                    {isLiked ? "Liké" : "Liker"}
                  </Button>
                  
                  <Button onClick={handleShare} variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Partager
                  </Button>

                  {isAuthenticated && (
                    <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Ajouter à une playlist
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter à une playlist</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          {playlists.map((playlist) => (
                            <Button
                              key={playlist.id}
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => handleAddToPlaylist(playlist.id)}
                            >
                              {playlist.name}
                            </Button>
                          ))}
                          {playlists.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">
                              Aucune playlist. Créez-en une d'abord !
                            </p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="w-6 h-6" />
              <h2 className="text-2xl font-bold">
                Commentaires ({comments.length})
              </h2>
            </div>

            {isAuthenticated ? (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1"
                  />
                  <Button type="submit">Envoyer</Button>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-muted-foreground">
                  <Button variant="link" onClick={() => navigate("/login")}>
                    Connectez-vous
                  </Button>{" "}
                  pour commenter
                </p>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{comment.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    {user?.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}

              {!loading && comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucun commentaire pour le moment
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <AudioPlayer
        currentTrack={{
          title: track.title,
          artist: track.artist,
          imageUrl: track.imageUrl,
          audioUrl: track.audioUrl,
        }}
        onLike={handleLike}
        isLiked={isLiked}
      />
    </div>
  );
};

export default TrackDetail;
