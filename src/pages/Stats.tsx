import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { useAuth } from "@/contexts/AuthContext";
import { localHistoryAPI } from "@/lib/api";
import { 
  BarChart3, Clock, Music, Users, TrendingUp, Calendar,
  Headphones, Heart, Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface HistoryTrack {
  track_id: string;
  track_title: string;
  track_artist: string;
  track_genre?: string;
  track_duration?: string;
  listened_at: string;
}

const Stats = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalTime: 0,
    topArtists: [] as { name: string; count: number }[],
    topGenres: [] as { name: string; count: number }[],
    recentActivity: [] as { date: string; count: number }[],
    listeningByHour: [] as number[],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    calculateStats();
  }, [isAuthenticated]);

  const calculateStats = () => {
    const history: HistoryTrack[] = localHistoryAPI.getHistory();
    
    // Total tracks
    const totalTracks = history.length;

    // Total time (estimate based on average track length of 3:30)
    let totalTime = 0;
    history.forEach(track => {
      if (track.track_duration) {
        const [mins, secs] = track.track_duration.split(":").map(Number);
        totalTime += (mins * 60) + (secs || 0);
      } else {
        totalTime += 210; // 3:30 default
      }
    });

    // Top artists
    const artistCounts: Record<string, number> = {};
    history.forEach(track => {
      const artist = track.track_artist || "Unknown";
      artistCounts[artist] = (artistCounts[artist] || 0) + 1;
    });
    const topArtists = Object.entries(artistCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top genres
    const genreCounts: Record<string, number> = {};
    history.forEach(track => {
      const genre = track.track_genre || "Unknown";
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    const topGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent activity (last 7 days)
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
      const count = history.filter(track => {
        const trackDate = new Date(track.listened_at);
        return trackDate.toDateString() === date.toDateString();
      }).length;
      last7Days.push({ date: dateStr, count });
    }

    // Listening by hour
    const hourCounts = new Array(24).fill(0);
    history.forEach(track => {
      const hour = new Date(track.listened_at).getHours();
      hourCounts[hour]++;
    });

    setStats({
      totalTracks,
      totalTime,
      topArtists,
      topGenres,
      recentActivity: last7Days,
      listeningByHour: hourCounts,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const maxActivity = Math.max(...stats.recentActivity.map(d => d.count), 1);
  const maxHour = Math.max(...stats.listeningByHour, 1);

  return (
    <div className="min-h-screen pb-32">
      <Navigation />

      <section className="pt-24 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/20">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Listening Stats</h1>
              <p className="text-muted-foreground">Your music journey</p>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-2">
                <Play className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Tracks Played</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalTracks}</p>
            </div>

            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Time Listened</span>
              </div>
              <p className="text-3xl font-bold">{formatTime(stats.totalTime)}</p>
            </div>

            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Artists</span>
              </div>
              <p className="text-3xl font-bold">{stats.topArtists.length}</p>
            </div>

            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3 mb-2">
                <Music className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Genres</span>
              </div>
              <p className="text-3xl font-bold">{stats.topGenres.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Artists */}
            <div className="glass-card p-6 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Artists
              </h3>
              {stats.topArtists.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Start listening to see your top artists
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topArtists.map((artist, i) => (
                    <div key={artist.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium truncate">{artist.name}</p>
                        <Progress 
                          value={(artist.count / stats.topArtists[0].count) * 100} 
                          className="h-1 mt-1"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {artist.count} plays
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Genres */}
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-primary" />
                Top Genres
              </h3>
              {stats.topGenres.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Start listening to see your top genres
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topGenres.map((genre, i) => (
                    <div key={genre.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium truncate">{genre.name}</p>
                        <Progress 
                          value={(genre.count / stats.topGenres[0].count) * 100} 
                          className="h-1 mt-1"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {genre.count} plays
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Activity */}
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                This Week
              </h3>
              <div className="flex items-end justify-between h-32 gap-2">
                {stats.recentActivity.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary/80 rounded-t transition-all"
                      style={{ 
                        height: `${(day.count / maxActivity) * 100}%`,
                        minHeight: day.count > 0 ? "8px" : "2px",
                        opacity: day.count > 0 ? 1 : 0.3,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Listening by Hour */}
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Peak Listening Hours
              </h3>
              <div className="flex items-end h-32 gap-0.5">
                {stats.listeningByHour.map((count, hour) => (
                  <div 
                    key={hour}
                    className="flex-1 bg-primary/80 rounded-t transition-all hover:bg-primary"
                    style={{ 
                      height: `${(count / maxHour) * 100}%`,
                      minHeight: count > 0 ? "4px" : "1px",
                      opacity: count > 0 ? 1 : 0.2,
                    }}
                    title={`${hour}:00 - ${count} plays`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>12am</span>
                <span>6am</span>
                <span>12pm</span>
                <span>6pm</span>
                <span>12am</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MobileNav />
    </div>
  );
};

export default Stats;
