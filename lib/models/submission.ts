import { answer, submission } from "@/lib/db/schema";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { z } from "zod";

export type Submission = InferSelectModel<typeof submission>;
export type NewSubmission = InferInsertModel<typeof submission>;

export type Answer = InferSelectModel<typeof answer>;
export type NewAnswer = InferInsertModel<typeof answer>;

export const StartSubmissionSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
});

export const SaveAnswerSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
  choiceIds: z.array(z.string()).optional(), // For choice-based questions
  textResponse: z.string().optional(), // For free_text questions
});

export const SubmitSubmissionSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
});

export const SubmissionIdSchema = z.string().min(1, "Submission ID is required");
