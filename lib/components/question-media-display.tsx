"use client";

import { Button } from "@/components/ui/button";
import { Pause, Play, Volume2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface QuestionMediaDisplayProps {
  imageSignedUrl?: string | null;
  audioSignedUrl?: string | null;
}

export function QuestionMediaDisplay({
  imageSignedUrl,
  audioSignedUrl,
}: QuestionMediaDisplayProps) {
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

  if (!imageSignedUrl && !audioSignedUrl) {
    return null;
  }

  return (
    <div className="space-y-3">
      {imageSignedUrl && (
        <div className="rounded-md overflow-hidden border bg-muted">
          <Image
            src={imageSignedUrl}
            alt="Question image"
            width={600}
            height={400}
            className="w-full h-auto max-h-64 object-contain"
          />
        </div>
      )}

      {audioSignedUrl && (
        <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/50">
          <audio ref={audioRef} src={audioSignedUrl} preload="metadata" />
          <Button
            type="button"
            size="icon"
            onClick={togglePlay}
            className="rounded-full"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Question audio</span>
        </div>
      )}
    </div>
  );
}
