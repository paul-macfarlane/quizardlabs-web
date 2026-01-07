"use server";

import type { Answer, Submission } from "@/lib/models/submission";
import {
  SaveAnswerSchema,
  StartSubmissionSchema,
  SubmissionIdSchema,
  SubmitSubmissionSchema,
} from "@/lib/models/submission";
import {
  type SubmissionWithAnswers,
  type SubmissionWithTestInfo,
  canUserAccessSubmission,
  getOrCreateSubmission,
  getSubmission,
  getSubmissionsByUser,
  isSubmissionInProgress,
  saveAnswer,
  submitSubmission,
} from "@/lib/services/submission";
import { getTest } from "@/lib/services/test";
import { getCurrentUser } from "@/lib/services/user";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface StartSubmissionResult {
  data?: { submission: Submission; isNew: boolean };
  error?: string;
}

export async function startSubmissionAction(
  input: unknown,
): Promise<StartSubmissionResult> {
  try {
    const validated = StartSubmissionSchema.parse(input);
    const user = await getCurrentUser();

    const test = await getTest(validated.testId);
    if (!test) {
      return { error: "Test not found" };
    }

    const result = await getOrCreateSubmission(validated.testId, user.id);

    revalidatePath("/taker");
    revalidatePath(`/test/${validated.testId}`);
    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid test data" };
    }
    return {
      error: error instanceof Error ? error.message : "Failed to start test",
    };
  }
}

export interface GetSubmissionsResult {
  data?: SubmissionWithTestInfo[];
  error?: string;
}

export async function getMySubmissionsAction(): Promise<GetSubmissionsResult> {
  try {
    const user = await getCurrentUser();
    const submissions = await getSubmissionsByUser(user.id);
    return { data: submissions };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch submissions",
    };
  }
}

export interface GetSubmissionResult {
  data?: SubmissionWithAnswers;
  error?: string;
}

export async function getSubmissionAction(
  input: unknown,
): Promise<GetSubmissionResult> {
  try {
    const submissionId = SubmissionIdSchema.parse(input);
    const user = await getCurrentUser();

    if (!(await canUserAccessSubmission(submissionId, user.id))) {
      return { error: "Access denied" };
    }

    const submission = await getSubmission(submissionId);
    if (!submission) {
      return { error: "Submission not found" };
    }

    return { data: submission };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid submission ID" };
    }
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch submission",
    };
  }
}

export interface SaveAnswerResult {
  data?: Answer[];
  error?: string;
}

export async function saveAnswerAction(
  input: unknown,
): Promise<SaveAnswerResult> {
  try {
    const validated = SaveAnswerSchema.parse(input);
    const user = await getCurrentUser();

    if (!(await canUserAccessSubmission(validated.submissionId, user.id))) {
      return { error: "Access denied" };
    }

    if (!(await isSubmissionInProgress(validated.submissionId))) {
      return { error: "Submission already completed" };
    }

    const answers = await saveAnswer(
      validated.submissionId,
      validated.questionId,
      {
        choiceIds: validated.choiceIds,
        textResponse: validated.textResponse,
      },
    );

    // No revalidation needed for auto-save (client-side state)
    return { data: answers };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid answer data" };
    }
    return {
      error: error instanceof Error ? error.message : "Failed to save answer",
    };
  }
}

export interface SubmitSubmissionResult {
  data?: Submission;
  error?: string;
}

export async function submitSubmissionAction(
  input: unknown,
): Promise<SubmitSubmissionResult> {
  try {
    const validated = SubmitSubmissionSchema.parse(input);
    const user = await getCurrentUser();

    if (!(await canUserAccessSubmission(validated.submissionId, user.id))) {
      return { error: "Access denied" };
    }

    if (!(await isSubmissionInProgress(validated.submissionId))) {
      return { error: "Submission already completed" };
    }

    const submission = await submitSubmission(validated.submissionId);
    if (!submission) {
      return { error: "Submission not found" };
    }

    return { data: submission };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid submission data" };
    }
    return {
      error: error instanceof Error ? error.message : "Failed to submit test",
    };
  }
}
