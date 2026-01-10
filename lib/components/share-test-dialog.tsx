"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareTestDialogProps {
  testId: string;
  testName: string;
  trigger?: React.ReactNode;
}

export function ShareTestDialog({
  testId,
  testName,
  trigger,
}: ShareTestDialogProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const testUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/test/${testId}`
      : `/test/${testId}`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(testId);
      setCopiedId(true);
      toast.success("Test ID copied to clipboard");
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(testUrl);
      setCopiedUrl(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Test</DialogTitle>
          <DialogDescription>
            Share with students so they can take &quot;{testName}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-id">Test ID</Label>
            <div className="flex items-center gap-2">
              <Input
                id="test-id"
                value={testId}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button onClick={handleCopyId} size="icon" variant="outline">
                {copiedId ? (
                  <Check className="h-4 w-4 text-success-foreground" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-url">Full Link</Label>
            <div className="flex items-center gap-2">
              <Input
                id="test-url"
                value={testUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button onClick={handleCopyUrl} size="icon" variant="outline">
                {copiedUrl ? (
                  <Check className="h-4 w-4 text-success-foreground" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Students can enter the ID or use the full link (login required).
        </p>
      </DialogContent>
    </Dialog>
  );
}
