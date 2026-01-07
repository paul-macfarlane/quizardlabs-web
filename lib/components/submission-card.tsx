"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubmissionWithTestInfo } from "@/lib/services/submission";
import { CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

interface SubmissionCardProps {
  submission: SubmissionWithTestInfo;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const isCompleted = submission.submittedAt !== null;

  return (
    <Link href={`/submission/${submission.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Started: {new Date(submission.startedAt).toLocaleString()}</p>
            {isCompleted && (
              <p>
                Submitted: {new Date(submission.submittedAt!).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
