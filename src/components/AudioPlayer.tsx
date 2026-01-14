import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Heart,
  Shuffle, Repeat, Repeat1, ListMusic, X, GripVertical, Timer,
  Radio, Share2, Twitter, Facebook, Link2, Gauge, Keyboard
} from "lucide-react";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

export interface QueueTrack {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
}

interface AudioPlayerProps {
  currentTrack: {
    title: string;
    artist: string;
    imageUrl: string;
    audioUrl: string;
  } | null;
  onNext?: () => void;
  onPrevious?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  queue?: QueueTrack[];
  onQueueChange?: (queue: QueueTrack[]) => void;
  onPlayFromQueue?: (index: number) => void;
}

export const AudioPlayer = ({
  currentTrack,
  onNext,
  onPrevious,
  onLike,
  isLiked = false,
  queue = [],
  onQueueChange,
  onPlayFromQueue,
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("player-volume");
    return saved ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [isBuffering, setIsBuffering] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);
  const [radioMode, setRadioMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(() => {
    const saved = localStorage.getItem("playback-speed");
    return saved ? parseFloat(saved) : 1;
  });
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(() => {
    return localStorage.getItem("crossfade") === "true";
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousVolume = useRef(volume);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback speed effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
    localStorage.setItem("playback-speed", playbackSpeed.toString());
  }, [playbackSpeed]);

  // Crossfade effect
  useEffect(() => {
    localStorage.setItem("crossfade", crossfadeEnabled.toString());
  }, [crossfadeEnabled]);

  const cyclePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
    toast.success(`Playback speed: ${speeds[nextIndex]}x`);
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback error:", err);
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem("player-volume", volume.toString());
  }, [volume, isMuted]);

  // Sleep timer effect
  useEffect(() => {
    if (sleepTimer !== null) {
      setSleepTimeRemaining(sleepTimer * 60);
      sleepTimerRef.current = setInterval(() => {
        setSleepTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            // Stop playback
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            setSleepTimer(null);
            toast.success("Sleep timer ended - playback stopped");
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, [sleepTimer]);

  const cancelSleepTimer = () => {
    setSleepTimer(null);
    setSleepTimeRemaining(null);
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
    }
    toast.success("Sleep timer cancelled");
  };

  const formatSleepTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShare = async (platform: "twitter" | "facebook" | "copy") => {
    const shareUrl = `${window.location.origin}/track/${currentTrack?.title}`;
    const shareText = `🎵 Listening to "${currentTrack?.title}" by ${currentTrack?.artist} on Discoverly!`;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          "_blank"
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
        break;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
          }
          break;
        case "ArrowRight":
          if (audioRef.current) {
            audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
          }
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyN":
          onNext?.();
          break;
        case "KeyP":
          onPrevious?.();
          break;
        case "KeyS":
          setIsShuffled(prev => !prev);
          break;
        case "KeyR":
          cycleRepeatMode();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [duration, onNext, onPrevious]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Playback error:", err);
        });
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(previousVolume.current);
      setIsMuted(false);
    } else {
      previousVolume.current = volume;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const handleEnded = useCallback(() => {
    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      onNext?.();
    }
  }, [repeatMode, onNext]);

  const removeFromQueue = (index: number) => {
    if (onQueueChange) {
      const newQueue = [...queue];
      newQueue.splice(index, 1);
      onQueueChange(newQueue);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="player-bar p-4">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
      />
      
      <div className="max-w-screen-2xl mx-auto flex items-center gap-6">
        {/* Track Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <img
            src={currentTrack.imageUrl}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold truncate">{currentTrack.title}</h4>
            <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
          {onLike && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLike}
              className="shrink-0"
            >
              <Heart
                className={`w-5 h-5 ${isLiked ? "fill-accent text-accent" : ""}`}
              />
            </Button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-[2] max-w-2xl">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsShuffled(!isShuffled)}
              className={isShuffled ? "text-primary" : "text-muted-foreground hover:text-foreground"}
              title="Shuffle (S)"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            {onPrevious && (
              <Button variant="ghost" size="icon" onClick={onPrevious} title="Previous (P)">
                <SkipBack className="w-5 h-5" />
              </Button>
            )}
            
            <Button
              size="icon"
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary-glow relative"
              onClick={togglePlay}
              title="Play/Pause (Space)"
            >
              {isBuffering ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
              )}
            </Button>
            
            {onNext && (
              <Button variant="ghost" size="icon" onClick={onNext} title="Next (N)">
                <SkipForward className="w-5 h-5" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleRepeatMode}
              className={repeatMode !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"}
              title="Repeat (R)"
            >
              {repeatMode === "one" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Visualizer */}
        {isPlaying && (
          <div className="hidden md:flex items-end gap-1 h-8 mx-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="visualizer-bar w-1"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {/* Volume & Controls */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground"
            title="Mute (M)"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={(value) => {
              setVolume(value[0] / 100);
              if (value[0] > 0) setIsMuted(false);
            }}
            className="w-24"
          />
          
          {/* Sleep Timer */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={sleepTimer !== null ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                title="Sleep Timer"
              >
                <Timer className="w-5 h-5" />
                {sleepTimeRemaining !== null && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-primary rounded px-1">
                    {formatSleepTime(sleepTimeRemaining)}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="space-y-2">
                <p className="text-sm font-medium">Sleep Timer</p>
                {sleepTimer === null ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[15, 30, 45, 60].map((mins) => (
                      <Button
                        key={mins}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSleepTimer(mins);
                          toast.success(`Sleep timer set for ${mins} minutes`);
                        }}
                      >
                        {mins}m
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {formatSleepTime(sleepTimeRemaining || 0)}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={cancelSleepTimer}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Playback Speed */}
          <Button
            variant="ghost"
            size="icon"
            onClick={cyclePlaybackSpeed}
            className={playbackSpeed !== 1 ? "text-primary" : "text-muted-foreground hover:text-foreground"}
            title={`Playback Speed: ${playbackSpeed}x`}
          >
            <span className="text-xs font-bold">{playbackSpeed}x</span>
          </Button>

          {/* Radio Mode */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setRadioMode(!radioMode);
              toast.success(radioMode ? "Radio mode off" : "Radio mode on - similar tracks will auto-play");
            }}
            className={radioMode ? "text-primary" : "text-muted-foreground hover:text-foreground"}
            title="Radio Mode - Auto-play similar tracks"
          >
            <Radio className="w-5 h-5" />
          </Button>

          {/* Keyboard Shortcuts */}
          <KeyboardShortcuts />

          {/* Share */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare("twitter")}>
                <Twitter className="w-4 h-4 mr-2" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("facebook")}>
                <Facebook className="w-4 h-4 mr-2" />
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleShare("copy")}>
                <Link2 className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Queue Button */}
          <Sheet open={showQueue} onOpenChange={setShowQueue}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={queue.length > 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                title="Queue"
              >
                <ListMusic className="w-5 h-5" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] rounded-full flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-card border-l w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ListMusic className="w-5 h-5" />
                  Queue ({queue.length})
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                {queue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListMusic className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Queue is empty</p>
                    <p className="text-sm">Add tracks to play next</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {queue.map((track, index) => (
                      <div
                        key={`${track.id}-${index}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group cursor-pointer"
                        onClick={() => onPlayFromQueue?.(index)}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(index);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};
