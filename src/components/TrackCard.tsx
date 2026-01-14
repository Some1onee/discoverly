import { Play, Heart, MessageCircle, ListPlus, MoreHorizontal, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TrackCardProps {
  trackId?: string;
  artistId?: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl?: string;
  duration?: string;
  genre?: string;
  onPlay: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  showComments?: boolean;
  onAddToQueue?: () => void;
  compact?: boolean;
}

export const TrackCard = ({
  trackId,
  artistId,
  title,
  artist,
  imageUrl,
  audioUrl,
  duration,
  genre,
  onPlay,
  onLike,
  isLiked = false,
  showComments = false,
  onAddToQueue,
  compact = false,
}: TrackCardProps) => {
  const navigate = useNavigate();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/track/${trackId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNavigateToTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trackId) {
      navigate(`/track/${trackId}`, {
        state: {
          track: { title, artist, imageUrl, audioUrl, duration, genre, id: trackId },
        },
      });
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group cursor-pointer transition-colors">
        <div className="relative w-12 h-12 shrink-0">
          <img
            src={imageUrl}
            alt={`${title} by ${artist}`}
            className="w-full h-full rounded object-cover"
          />
          <button
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Play className="w-5 h-5" fill="currentColor" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm">{title}</p>
          <p 
            className="text-xs text-muted-foreground truncate hover:text-primary cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (artistId) navigate(`/artist/${artistId}`);
            }}
          >{artist}</p>
        </div>
        {duration && (
          <span className="text-xs text-muted-foreground">{duration}</span>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onLike && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-accent text-accent" : ""}`} />
            </Button>
          )}
          {onAddToQueue && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={(e) => {
                e.stopPropagation();
                onAddToQueue();
                toast.success("Added to queue");
              }}
            >
              <ListPlus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 hover-lift group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={imageUrl}
          alt={`${title} by ${artist}`}
          className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="icon"
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary-glow hover:scale-110 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          </Button>
          {showComments && trackId && (
            <Button
              size="icon"
              variant="secondary"
              className="w-12 h-12 rounded-full"
              onClick={handleNavigateToTrack}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          )}
        </div>
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
            {duration}
          </div>
        )}
        
        {/* Context Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onAddToQueue && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToQueue();
                    toast.success("Added to queue");
                  }}
                >
                  <ListPlus className="w-4 h-4 mr-2" />
                  Add to Queue
                </DropdownMenuItem>
              )}
              {trackId && (
                <DropdownMenuItem onClick={handleNavigateToTrack}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground truncate">{title}</h3>
        <p 
          className="text-sm text-muted-foreground truncate hover:text-primary cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (artistId) navigate(`/artist/${artistId}`);
          }}
        >{artist}</p>
        
        <div className="flex items-center gap-2">
          {onLike && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 hover:text-accent transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${isLiked ? "fill-accent text-accent" : ""}`}
              />
              {isLiked ? "Liké" : "Liker"}
            </Button>
          )}
          {onAddToQueue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddToQueue();
                toast.success("Added to queue");
              }}
              title="Add to Queue"
            >
              <ListPlus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
