"use client";

import { Button } from "@/components/ui/button";
import {
  deleteMediaAction,
  getMediaUploadUrlAction,
} from "@/lib/actions/media";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploaderProps {
  testId: string;
  questionId: string;
  currentImageSignedUrl?: string | null;
  onUpload: (key: string) => void;
  onRemove: () => void;
}

export function ImageUploader({
  testId,
  questionId,
  currentImageSignedUrl,
  onUpload,
  onRemove,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deleteCurrentImage = async () => {
    const result = await deleteMediaAction({
      type: "question_image",
      questionId,
    });
    if (result.error) {
      throw new Error(result.error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await getMediaUploadUrlAction({
        type: "question_image",
        testId,
        questionId,
        contentType: file.type,
      });

      if (uploadResult.error || !uploadResult.data) {
        toast.error(uploadResult.error || "Failed to get upload URL");
        return;
      }

      const uploadResponse = await fetch(uploadResult.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      if (currentImageSignedUrl) {
        await deleteCurrentImage();
      }

      onUpload(uploadResult.data.key);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!currentImageSignedUrl) return;

    setIsDeleting(true);
    try {
      await deleteCurrentImage();
      onRemove();
      toast.success("Image removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove image",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {currentImageSignedUrl ? (
        <div className="relative rounded-md border overflow-hidden">
          <Image
            src={currentImageSignedUrl}
            alt="Question image"
            width={400}
            height={300}
            className="w-full h-auto max-h-48 object-contain bg-muted"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={handleRemove}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 flex flex-col gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-6 w-6" />
              <span>Click to upload image</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
