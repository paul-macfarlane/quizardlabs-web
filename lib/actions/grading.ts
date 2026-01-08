"use server";

import { auth } from "@/lib/auth";
import { GradeAnswerSchema, SubmissionIdSchema } from "@/lib/models/submission";
import {
  canUserGradeAnswer,
  canUserGradeSubmission,
  gradeAnswer,
  recalculateSubmissionScore,
} from "@/lib/services/grading";
import { getCurrentUser } from "@/lib/services/user";
import { headers } from "next/headers";

export interface GradeAnswerResult {
  error?: string;
}

export async function gradeAnswerAction(
  input: unknown,
): Promise<GradeAnswerResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const parsed = GradeAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { answerId, isCorrect } = parsed.data;
  const user = await getCurrentUser();

  const canGrade = await canUserGradeAnswer(answerId, user.id);
  if (!canGrade) {
    return { error: "You don't have permission to grade this answer" };
  }

  const result = await gradeAnswer(answerId, isCorrect, user.id);
  if (!result) {
    return { error: "Answer not found" };
  }

  return {};
}

export interface RecalculateScoreResult {
  error?: string;
}

export async function recalculateScoreAction(
  input: unknown,
): Promise<RecalculateScoreResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const parsed = SubmissionIdSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const submissionId = parsed.data;
  const user = await getCurrentUser();

  const canGrade = await canUserGradeSubmission(submissionId, user.id);
  if (!canGrade) {
    return { error: "You don't have permission to grade this submission" };
  }

  await recalculateSubmissionScore(submissionId);

  return {};
}
