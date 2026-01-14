import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";

interface EqualizerProps {
  audioContext: AudioContext | null;
  sourceNode: MediaElementAudioSourceNode | null;
}

const PRESETS = {
  flat: { bass: 0, mid: 0, treble: 0, name: "Flat" },
  bass: { bass: 6, mid: 0, treble: -2, name: "Bass Boost" },
  treble: { bass: -2, mid: 0, treble: 6, name: "Treble Boost" },
  vocal: { bass: -2, mid: 4, treble: 2, name: "Vocal" },
  rock: { bass: 4, mid: -1, treble: 3, name: "Rock" },
  electronic: { bass: 5, mid: 2, treble: 4, name: "Electronic" },
  acoustic: { bass: 2, mid: 3, treble: 1, name: "Acoustic" },
  jazz: { bass: 3, mid: -2, treble: 3, name: "Jazz" },
};

export const Equalizer = ({ audioContext, sourceNode }: EqualizerProps) => {
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);
  const [activePreset, setActivePreset] = useState<string>("flat");
  
  const bassFilter = useRef<BiquadFilterNode | null>(null);
  const midFilter = useRef<BiquadFilterNode | null>(null);
  const trebleFilter = useRef<BiquadFilterNode | null>(null);
  const isConnected = useRef(false);

  useEffect(() => {
    if (!audioContext || !sourceNode || isConnected.current) return;

    // Create filters
    bassFilter.current = audioContext.createBiquadFilter();
    bassFilter.current.type = "lowshelf";
    bassFilter.current.frequency.value = 200;
    bassFilter.current.gain.value = bass;

    midFilter.current = audioContext.createBiquadFilter();
    midFilter.current.type = "peaking";
    midFilter.current.frequency.value = 1000;
    midFilter.current.Q.value = 1;
    midFilter.current.gain.value = mid;

    trebleFilter.current = audioContext.createBiquadFilter();
    trebleFilter.current.type = "highshelf";
    trebleFilter.current.frequency.value = 3000;
    trebleFilter.current.gain.value = treble;

    // Connect: source -> bass -> mid -> treble -> destination
    sourceNode.connect(bassFilter.current);
    bassFilter.current.connect(midFilter.current);
    midFilter.current.connect(trebleFilter.current);
    trebleFilter.current.connect(audioContext.destination);

    isConnected.current = true;

    // Load saved settings
    const saved = localStorage.getItem("equalizer");
    if (saved) {
      const { bass: b, mid: m, treble: t, preset } = JSON.parse(saved);
      setBass(b);
      setMid(m);
      setTreble(t);
      setActivePreset(preset || "flat");
    }

    return () => {
      if (bassFilter.current) bassFilter.current.disconnect();
      if (midFilter.current) midFilter.current.disconnect();
      if (trebleFilter.current) trebleFilter.current.disconnect();
      isConnected.current = false;
    };
  }, [audioContext, sourceNode]);

  useEffect(() => {
    if (bassFilter.current) bassFilter.current.gain.value = bass;
    if (midFilter.current) midFilter.current.gain.value = mid;
    if (trebleFilter.current) trebleFilter.current.gain.value = treble;
    
    localStorage.setItem("equalizer", JSON.stringify({ bass, mid, treble, preset: activePreset }));
  }, [bass, mid, treble, activePreset]);

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey as keyof typeof PRESETS];
    if (preset) {
      setBass(preset.bass);
      setMid(preset.mid);
      setTreble(preset.treble);
      setActivePreset(presetKey);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          title="Equalizer"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Equalizer</h4>
            <span className="text-xs text-muted-foreground">{PRESETS[activePreset as keyof typeof PRESETS]?.name}</span>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant={activePreset === key ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => applyPreset(key)}
              >
                {preset.name}
              </Button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bass</span>
                <span className="text-muted-foreground">{bass > 0 ? `+${bass}` : bass} dB</span>
              </div>
              <Slider
                value={[bass]}
                min={-12}
                max={12}
                step={1}
                onValueChange={([v]) => {
                  setBass(v);
                  setActivePreset("custom");
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mid</span>
                <span className="text-muted-foreground">{mid > 0 ? `+${mid}` : mid} dB</span>
              </div>
              <Slider
                value={[mid]}
                min={-12}
                max={12}
                step={1}
                onValueChange={([v]) => {
                  setMid(v);
                  setActivePreset("custom");
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Treble</span>
                <span className="text-muted-foreground">{treble > 0 ? `+${treble}` : treble} dB</span>
              </div>
              <Slider
                value={[treble]}
                min={-12}
                max={12}
                step={1}
                onValueChange={([v]) => {
                  setTreble(v);
                  setActivePreset("custom");
                }}
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => applyPreset("flat")}
          >
            Reset to Flat
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
