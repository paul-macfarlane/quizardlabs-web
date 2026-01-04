"use client";

import { Button } from "@/components/ui/button";
import {
  deleteMediaAction,
  getMediaUploadUrlAction,
} from "@/lib/actions/media";
import type { MediaType } from "@/lib/services/media";
import {
  Loader2,
  Mic,
  Pause,
  Play,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { toast } from "sonner";

interface AudioRecorderProps {
  type: "question_audio" | "choice_audio";
  testId: string;
  questionId: string;
  choiceId?: string;
  currentAudioSignedUrl?: string | null;
  onUpload: (key: string) => void;
  onRemove: () => void;
}

export function AudioRecorder({
  type,
  testId,
  questionId,
  choiceId,
  currentAudioSignedUrl,
  onUpload,
  onRemove,
}: AudioRecorderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlayingExisting, setIsPlayingExisting] = useState(false);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const existingAudioRef = useRef<HTMLAudioElement>(null);
  const recordedAudioRef = useRef<HTMLAudioElement>(null);

  const deleteCurrentAudio = async () => {
    const result = await deleteMediaAction({
      type,
      questionId,
      choiceId,
    });
    if (result.error) {
      throw new Error(result.error);
    }
  };

  const {
    status,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: "audio/webm" },
  });

  useEffect(() => {
    const audio = existingAudioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlayingExisting(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentAudioSignedUrl]);

  useEffect(() => {
    const audio = recordedAudioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlayingRecorded(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [mediaBlobUrl]);

  const toggleExistingAudio = () => {
    const audio = existingAudioRef.current;
    if (!audio) return;

    if (isPlayingExisting) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play();
    }
    setIsPlayingExisting(!isPlayingExisting);
  };

  const toggleRecordedAudio = () => {
    const audio = recordedAudioRef.current;
    if (!audio) return;

    if (isPlayingRecorded) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play();
    }
    setIsPlayingRecorded(!isPlayingRecorded);
  };

  const handleUpload = async () => {
    if (!mediaBlobUrl) return;

    setIsUploading(true);
    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();

      const uploadResult = await getMediaUploadUrlAction({
        type: type as MediaType,
        testId,
        questionId,
        choiceId,
        contentType: "audio/webm",
      });

      if (uploadResult.error || !uploadResult.data) {
        toast.error(uploadResult.error || "Failed to get upload URL");
        return;
      }

      const uploadResponse = await fetch(uploadResult.data.uploadUrl, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "audio/webm",
        },
      });
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload audio");
      }

      if (currentAudioSignedUrl) {
        await deleteCurrentAudio();
      }

      clearBlobUrl();
      onUpload(uploadResult.data.key);
      toast.success("Audio uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentAudioSignedUrl) return;

    setIsDeleting(true);
    try {
      await deleteCurrentAudio();
      onRemove();
      toast.success("Audio removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove audio",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isRecording = status === "recording";
  const isPaused = status === "paused";
  const hasRecording = !!mediaBlobUrl;

  return (
    <div className="space-y-3">
      {currentAudioSignedUrl && (
        <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
          <audio
            ref={existingAudioRef}
            src={currentAudioSignedUrl}
            preload="metadata"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleExistingAudio}
            className="h-8 w-8 p-0"
            aria-label={isPlayingExisting ? "Pause" : "Play existing audio"}
          >
            {isPlayingExisting ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <span className="flex-1 text-sm text-muted-foreground">
            Current audio
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isDeleting}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            aria-label="Remove audio"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isRecording && !isPaused && !hasRecording && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Record
          </Button>
        )}

        {(isRecording || isPaused) && (
          <>
            <Button
              type="button"
              variant={isRecording ? "default" : "outline"}
              size="sm"
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="gap-2"
            >
              {isRecording ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Resume
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={stopRecording}
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
            {isRecording && (
              <span className="text-sm text-destructive animate-pulse">
                Recording...
              </span>
            )}
          </>
        )}

        {hasRecording && !isRecording && !isPaused && (
          <>
            <audio
              ref={recordedAudioRef}
              src={mediaBlobUrl}
              preload="metadata"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleRecordedAudio}
              className="gap-2"
            >
              {isPlayingRecorded ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleUpload}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearBlobUrl}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Discard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
