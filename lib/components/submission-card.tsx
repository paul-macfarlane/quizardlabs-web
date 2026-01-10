"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubmissionWithTestInfo } from "@/lib/services/submission";
import { formatScore, getGradeColorClass } from "@/lib/utils";
import { CheckCircle, Clock, Hourglass, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SubmissionCardProps {
  submission: SubmissionWithTestInfo;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const router = useRouter();
  const isCompleted = submission.submittedAt !== null;
  const isFullyGraded = submission.isFullyGraded;
  const isInProgress = !isCompleted;

  const handleRetake = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/test/${submission.test.id}`);
  };

  return (
    <Link href={`/submission/${submission.id}`}>
      <Card
        className={`hover:shadow-md hover:border-primary/50 transition-all cursor-pointer ${
          isInProgress ? "border-warning border-2 hover:border-warning" : ""
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {submission.test.name}
              </CardTitle>
              {submission.test.description && (
                <CardDescription className="truncate">
                  {submission.test.description}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isCompleted
                    ? "bg-success text-success-foreground"
                    : "bg-warning text-warning-foreground"
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">Completed</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span className="hidden sm:inline">In Progress</span>
                  </>
                )}
              </span>
              {isCompleted && (
                <span className="text-sm font-medium">
                  {isFullyGraded ? (
                    <span
                      className={getGradeColorClass(
                        submission.score ?? 0,
                        submission.maxScore ?? 1,
                      )}
                    >
                      {formatScore(
                        submission.score ?? 0,
                        submission.maxScore ?? 0,
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Hourglass className="h-3 w-3" />
                      Pending review
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {isCompleted ? (
                <p>
                  Submitted:{" "}
                  {new Date(submission.submittedAt!).toLocaleString()}
                </p>
              ) : (
                <p>
                  Started: {new Date(submission.startedAt).toLocaleString()}
                </p>
              )}
            </div>
            {isCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="shrink-0"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Retake
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
