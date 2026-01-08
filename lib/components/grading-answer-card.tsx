"use client";

import { Button } from "@/components/ui/button";
import {
  gradeAnswerAction,
  recalculateScoreAction,
} from "@/lib/actions/grading";
import type { AnswerForGrading } from "@/lib/services/grading";
import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface GradingAnswerCardProps {
  answer: AnswerForGrading;
  submissionId: string;
}

export function GradingAnswerCard({
  answer,
  submissionId,
}: GradingAnswerCardProps) {
  const router = useRouter();
  const [isGrading, setIsGrading] = useState(false);

  const handleGrade = async (isCorrect: boolean) => {
    setIsGrading(true);

    const result = await gradeAnswerAction({
      answerId: answer.id,
      isCorrect,
    });

    if (result.error) {
      toast.error(result.error);
      setIsGrading(false);
      return;
    }

    await recalculateScoreAction(submissionId);

    toast.success(`Marked as ${isCorrect ? "correct" : "incorrect"}`);
    router.refresh();
    setIsGrading(false);
  };

  return (
    <div className="p-4 rounded-lg border bg-muted/50">
      <div className="mb-3">
        <p className="text-sm text-muted-foreground mb-1">
          {answer.questionType === "free_text"
            ? "Free Text"
            : answer.questionType}
        </p>
        <p className="font-medium">{answer.questionText}</p>
      </div>

      <div className="bg-background p-3 rounded border mb-4">
        <p className="text-sm text-muted-foreground mb-1">Student Response:</p>
        <p className="font-mono text-sm">
          {answer.textResponse || answer.choiceText || (
            <span className="text-muted-foreground italic">No response</span>
          )}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleGrade(true)}
          disabled={isGrading}
          className="flex-1 text-success-foreground hover:bg-success/50"
        >
          {isGrading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Correct
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleGrade(false)}
          disabled={isGrading}
          className="flex-1 text-destructive hover:bg-destructive/10"
        >
          {isGrading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <X className="w-4 h-4 mr-2" />
              Incorrect
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
