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
  const [copied, setCopied] = useState(false);

  const testUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/test/${testId}`
      : `/test/${testId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(testUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
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
            Share this link with students so they can take &quot;{testName}
            &quot;
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input value={testUrl} readOnly className="flex-1" />
          <Button onClick={handleCopy} size="icon" variant="outline">
            {copied ? (
              <Check className="h-4 w-4 text-success-foreground" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Anyone with this link can take the test (login required).
        </p>
      </DialogContent>
    </Dialog>
  );
}
