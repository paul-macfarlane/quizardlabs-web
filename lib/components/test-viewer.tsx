"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  saveAnswerAction,
  submitSubmissionAction,
} from "@/lib/actions/submission";
import type { Submission } from "@/lib/models/submission";
import type { Test } from "@/lib/models/test";
import type { QuestionWithChoicesAndSignedUrls } from "@/lib/services/question";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { QuestionResponse } from "./question-response";

interface AnswerState {
  selectedChoiceIds: string[];
  textResponse: string;
}

interface TestViewerProps {
  test: Test;
  questions: QuestionWithChoicesAndSignedUrls[];
  submission: Submission;
  initialAnswers: Record<string, AnswerState>;
}

export function TestViewer({
  test,
  questions,
  submission,
  initialAnswers,
}: TestViewerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] =
    useState<Record<string, AnswerState>>(initialAnswers);
  const [savingQuestions, setSavingQuestions] = useState<Set<string>>(
    () => new Set(),
  );

  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const isSubmittingRef = useRef(false);

  const autoSave = useCallback(
    (questionId: string, answer: AnswerState) => {
      if (saveTimeouts.current[questionId]) {
        clearTimeout(saveTimeouts.current[questionId]);
      }

      saveTimeouts.current[questionId] = setTimeout(async () => {
        setSavingQuestions((prev) => new Set(prev).add(questionId));

        const result = await saveAnswerAction({
          submissionId: submission.id,
          questionId,
          choiceIds:
            answer.selectedChoiceIds.length > 0
              ? answer.selectedChoiceIds
              : undefined,
          textResponse: answer.textResponse || undefined,
        });

        setSavingQuestions((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });

        if (result.error) {
          toast.error(`Failed to save: ${result.error}`);
        }
      }, 500);
    },
    [submission.id],
  );

  useEffect(() => {
    const timeouts = saveTimeouts.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);

  const handleChoiceChange = (questionId: string, choiceIds: string[]) => {
    const newAnswer = {
      ...answers[questionId],
      selectedChoiceIds: choiceIds,
    };
    setAnswers((prev) => ({ ...prev, [questionId]: newAnswer }));
    autoSave(questionId, newAnswer);
  };

  const handleTextChange = (questionId: string, text: string) => {
    const newAnswer = {
      ...answers[questionId],
      textResponse: text,
    };
    setAnswers((prev) => ({ ...prev, [questionId]: newAnswer }));
    autoSave(questionId, newAnswer);
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    Object.values(saveTimeouts.current).forEach(clearTimeout);

    setIsSubmitting(true);

    const savePromises = Object.entries(answers).map(([questionId, answer]) =>
      saveAnswerAction({
        submissionId: submission.id,
        questionId,
        choiceIds:
          answer.selectedChoiceIds.length > 0
            ? answer.selectedChoiceIds
            : undefined,
        textResponse: answer.textResponse || undefined,
      }),
    );

    await Promise.all(savePromises);

    const result = await submitSubmissionAction({
      submissionId: submission.id,
    });

    if (result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    } else {
      toast.success("Test submitted successfully!");
      window.location.href = "/taker";
    }
  };

  const isTestCompleted = submission.submittedAt !== null;
  const isSaving = savingQuestions.size > 0;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-sm border p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {test.name}
        </h1>
        {test.description && (
          <p className="text-muted-foreground">{test.description}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
          {isSaving && (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
          {!isSaving && !isTestCompleted && (
            <span className="flex items-center gap-1 text-success-foreground">
              <CheckCircle className="h-3 w-3" />
              All changes saved
            </span>
          )}
        </div>
      </div>

      {isTestCompleted && (
        <Card className="bg-success border-success">
          <CardContent className="py-6 text-center">
            <CheckCircle className="h-8 w-8 text-success-foreground mx-auto mb-2" />
            <p className="text-success-foreground font-medium">
              This test has been submitted
            </p>
            <p className="text-success-foreground/80 text-sm">
              Submitted on {new Date(submission.submittedAt!).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <QuestionResponse
                question={question}
                questionNumber={index + 1}
                selectedChoiceIds={
                  answers[question.id]?.selectedChoiceIds || []
                }
                textResponse={answers[question.id]?.textResponse || ""}
                onChoiceChange={(ids) => handleChoiceChange(question.id, ids)}
                onTextChange={(text) => handleTextChange(question.id, text)}
                disabled={isTestCompleted}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {!isTestCompleted && (
        <div className="flex justify-end pb-8">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Test"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
