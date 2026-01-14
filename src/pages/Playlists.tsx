import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { playlistsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, List, Music } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

const Playlists = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchPlaylists = async () => {
      try {
        const data = await playlistsAPI.getUserPlaylists();
        setPlaylists(data);
      } catch (error) {
        toast.error(t("msg.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [isAuthenticated, navigate]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newPlaylist = await playlistsAPI.createPlaylist(newPlaylistName, newPlaylistDescription);
      setPlaylists([newPlaylist, ...playlists]);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setDialogOpen(false);
      toast.success(t("msg.playlistCreated"));
    } catch (error) {
      toast.error(t("msg.error"));
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    try {
      await playlistsAPI.deletePlaylist(playlistId);
      setPlaylists(playlists.filter((p) => p.id !== playlistId));
      toast.success(t("msg.success"));
    } catch (error) {
      toast.error(t("msg.error"));
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <Navigation />
      
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <List className="w-12 h-12 text-primary" />
              <div>
                <h2 className="text-4xl font-bold">{t("playlists.title")}</h2>
                <p className="text-muted-foreground">
                  {playlists.length} {playlists.length > 1 ? t("playlists.countPlural") : t("playlists.count")}
                </p>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nouvelle Playlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une playlist</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePlaylist} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Ma super playlist"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Input
                      id="description"
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      placeholder="Description de la playlist"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Créer
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          )}

          {!loading && playlists.length === 0 && (
            <div className="glass-card p-12 text-center">
              <List className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground mb-4">
                Aucune playlist pour le moment
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Créer ma première playlist
              </Button>
            </div>
          )}

          {!loading && playlists.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="glass-card p-6 hover-lift group cursor-pointer"
                >
                  <div className="flex items-center justify-center w-full aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4">
                    <Music className="w-16 h-16 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 truncate">{playlist.name}</h3>
                  {playlist.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {playlist.description}
                    </p>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeletePlaylist(playlist.id);
                    }}
                  >
                    Supprimer
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Playlists;
