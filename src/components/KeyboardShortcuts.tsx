import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const shortcuts = [
  { key: "Space", action: "Play / Pause" },
  { key: "←", action: "Rewind 10 seconds" },
  { key: "→", action: "Forward 10 seconds" },
  { key: "↑", action: "Volume up" },
  { key: "↓", action: "Volume down" },
  { key: "M", action: "Mute / Unmute" },
  { key: "N", action: "Next track" },
  { key: "P", action: "Previous track" },
  { key: "S", action: "Toggle shuffle" },
  { key: "R", action: "Cycle repeat mode" },
  { key: "L", action: "Like current track" },
  { key: "Q", action: "Open queue" },
  { key: "?", action: "Show shortcuts" },
  { key: "Esc", action: "Close dialogs" },
];

export const KeyboardShortcuts = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-5 h-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {shortcuts.map(({ key, action }) => (
              <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">{action}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-background rounded border">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            Press <kbd className="px-1 bg-muted rounded">?</kbd> anywhere to show this dialog
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
