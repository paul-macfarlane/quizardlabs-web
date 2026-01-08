"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChoiceAudioDisplayProps {
  audioSignedUrl: string;
}

export function ChoiceAudioDisplay({
  audioSignedUrl,
}: ChoiceAudioDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioSignedUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-1">
      <audio ref={audioRef} src={audioSignedUrl} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        aria-label={isPlaying ? "Pause" : "Play choice audio"}
      >
        {isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3 ml-0.5" />
        )}
      </button>
      <Volume2 className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}
