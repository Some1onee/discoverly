import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { TrackCard } from "@/components/TrackCard";
import { AudioPlayer, QueueTrack } from "@/components/AudioPlayer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2, Filter, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { likesAPI, recommendationsAPI } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

const GENRES = [
  "All Genres",
  "Electronic",
  "Hip-Hop/Rap",
  "Rock",
  "Pop",
  "R&B/Soul",
  "Jazz",
  "Classical",
  "Country",
  "Folk",
  "Metal",
  "Punk",
  "World",
  "Ambient",
  "House",
  "Techno",
  "Drum & Bass",
];

const SORT_OPTIONS = [
  { value: "relevant", label: "Most Relevant" },
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Search = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("relevant");
  const [queue, setQueue] = useState<QueueTrack[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `${AUDIUS_API_HOST}/v1/tracks/search?query=${encodeURIComponent(searchQuery)}&limit=50`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const data = await response.json();

      const formattedTracks: Track[] = data.data.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.user.name,
        imageUrl: track.artwork?.["480x480"] || track.artwork?.["150x150"] || "/placeholder.svg",
        audioUrl: `${AUDIUS_API_HOST}/v1/tracks/${track.id}/stream`,
        duration: formatDuration(track.duration),
        genre: track.genre || track.mood || "Unknown",
      }));

      setTracks(formattedTracks);
    } catch (error) {
      toast.error(t("msg.error"));
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Auto-search on debounced query change
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery, performSearch]);

  // Filter and sort tracks
  useEffect(() => {
    let result = [...tracks];

    // Filter by genre
    if (selectedGenre !== "All Genres") {
      result = result.filter(track =>
        track.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "recent") {
      result = result.reverse();
    } else if (sortBy === "popular") {
      // Keep original order (trending)
    }

    setFilteredTracks(result);
  }, [tracks, selectedGenre, sortBy]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error(t("msg.enterSearch"));
      return;
    }

    performSearch(query);
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

  const handleAddToQueue = (track: Track) => {
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

  const clearFilters = () => {
    setSelectedGenre("All Genres");
    setSortBy("relevant");
  };

  const handleLike = async (track: Track) => {
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
    if (!currentTrack || filteredTracks.length === 0) return;
    const currentIndex = filteredTracks.findIndex((t) => t.title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % filteredTracks.length;
    handlePlay(filteredTracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentTrack || filteredTracks.length === 0) return;
    const currentIndex = filteredTracks.findIndex((t) => t.title === currentTrack.title);
    const prevIndex = currentIndex === 0 ? filteredTracks.length - 1 : currentIndex - 1;
    handlePlay(filteredTracks[prevIndex]);
  };

  const activeFiltersCount = (selectedGenre !== "All Genres" ? 1 : 0) + (sortBy !== "relevant" ? 1 : 0);

  return (
    <div className="min-h-screen pb-32">
      <Navigation />

      <section className="pt-24 pb-12 px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">{t("search.title")}</h2>
            <p className="text-muted-foreground">
              {t("search.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4 max-w-3xl">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 relative"
              >
                <Filter className="w-5 h-5" />
                {t("search.filters")}
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("search.searching")}
                  </>
                ) : (
                  t("search.button")
                )}
              </Button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="glass-card p-4 mb-6 max-w-3xl animate-slide-up">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm text-muted-foreground mb-1 block">{t("search.genre")}</label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm text-muted-foreground mb-1 block">{t("search.sortBy")}</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-5">
                    <X className="w-4 h-4 mr-1" />
                    {t("search.clearFilters")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          )}

          {!loading && searched && filteredTracks.length === 0 && (
            <div className="glass-card p-12 text-center">
              <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">
                {t("search.noResults")} "{query}"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("search.tryOther")}
              </p>
              {activeFiltersCount > 0 && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  {t("search.clearFilters")}
                </Button>
              )}
            </div>
          )}

          {!loading && filteredTracks.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {filteredTracks.length} {filteredTracks.length > 1 ? t("search.resultsPlural") : t("search.results")} {t("search.for")} "{query}"
                </h3>
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2">
                    {selectedGenre !== "All Genres" && (
                      <Badge variant="secondary" className="gap-1">
                        {selectedGenre}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedGenre("All Genres")} />
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredTracks.map((track) => (
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
            </>
          )}

          {!searched && !loading && (
            <div className="glass-card p-12 text-center">
              <SearchIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
              <p className="text-xl font-semibold mb-2">
                {t("search.searchPrompt")}
              </p>
              <p className="text-muted-foreground">
                {t("search.searchDesc")}
              </p>
            </div>
          )}
        </div>
      </section>

      <AudioPlayer
        currentTrack={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onLike={() => {
          const track = filteredTracks.find((t) => t.title === currentTrack?.title);
          if (track) handleLike(track);
        }}
        isLiked={
          currentTrack
            ? likedTracks.has(filteredTracks.find((t) => t.title === currentTrack.title)?.id || "")
            : false
        }
        queue={queue}
        onQueueChange={setQueue}
        onPlayFromQueue={handlePlayFromQueue}
      />
    </div>
  );
};

export default Search;
