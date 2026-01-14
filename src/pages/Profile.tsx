import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Camera, Music, Heart, List as ListIcon, MessageCircle, MapPin, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api";

const Profile = () => {
  const { isAuthenticated, user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/profile/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setFullName(profileData.full_name || "");
          setBio(profileData.bio || "");
          setLocation(profileData.location || "");
          setWebsite(profileData.website || "");
          setAvatarUrl(profileData.avatar_url || "");
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        toast.error(t("msg.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate, token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("msg.imageTooLarge"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          bio: bio,
          location: location,
          website: website,
          avatar_url: avatarUrl,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      toast.success(t("msg.profileUpdated"));
    } catch (error) {
      toast.error(t("msg.error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <Navigation />

      <section className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Mon Profil</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Musiques Likées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.likes_count || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <ListIcon className="w-4 h-4" />
                  Playlists
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.playlists_count || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Commentaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.comments_count || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Modifier mon profil</CardTitle>
              <CardDescription>
                Personnalisez votre profil avec une photo, une bio et plus encore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary/80 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="font-semibold">{user?.username}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cliquez sur l'icône pour changer votre photo
                    </p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Votre nom complet"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous et de vos goûts musicaux..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/500 caractères
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Localisation
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Ville, Pays"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={100}
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Site web
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://votre-site.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    maxLength={200}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats détaillées */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  <span>Écoutes totales</span>
                </div>
                <span className="font-bold">{stats?.listens_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-accent" />
                  <span>Musiques likées</span>
                </div>
                <span className="font-bold">{stats?.likes_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListIcon className="w-5 h-5 text-primary" />
                  <span>Playlists créées</span>
                </div>
                <span className="font-bold">{stats?.playlists_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span>Commentaires postés</span>
                </div>
                <span className="font-bold">{stats?.comments_count || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Profile;
