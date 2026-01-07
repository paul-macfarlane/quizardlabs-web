"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function TestLinkForm() {
  const router = useRouter();
  const [testInput, setTestInput] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!testInput.trim()) {
      toast.error("Please enter a test link or ID");
      return;
    }

    let testId = testInput.trim();

    try {
      const url = new URL(testInput);
      const pathParts = url.pathname.split("/");
      const testIndex = pathParts.indexOf("test");
      if (testIndex !== -1 && pathParts[testIndex + 1]) {
        testId = pathParts[testIndex + 1];
      }
    } catch {
      // Not a URL, use as-is (assume it's a test ID)
    }

    setIsNavigating(true);
    router.push(`/test/${testId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={testInput}
        onChange={(e) => setTestInput(e.target.value)}
        placeholder="Paste test link or enter test ID..."
        className="flex-1"
      />
      <Button type="submit" disabled={isNavigating}>
        <ExternalLink className="h-4 w-4 mr-2" />
        Go
      </Button>
    </form>
  );
}
