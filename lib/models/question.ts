import { choice, question } from "@/lib/db/schema";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { z } from "zod";

export type Question = InferSelectModel<typeof question>;
export type NewQuestion = InferInsertModel<typeof question>;

export type Choice = InferSelectModel<typeof choice>;
export type NewChoice = InferInsertModel<typeof choice>;

export const QUESTION_TYPES = [
  "multi_choice",
  "multi_answer",
  "free_text",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const FREE_TEXT_MODES = ["exact_match", "manual"] as const;

export type FreeTextMode = (typeof FREE_TEXT_MODES)[number];

export function getQuestionTypeDisplayName(type: QuestionType): string {
  const displayNames: Record<QuestionType, string> = {
    multi_choice: "Multiple Choice",
    multi_answer: "Multiple Answer",
    free_text: "Free Text",
  };
  return displayNames[type];
}

export function getFreeTextModeDisplayName(mode: FreeTextMode): string {
  const displayNames: Record<FreeTextMode, string> = {
    exact_match: "Exact Match",
    manual: "Manual Grading",
  };
  return displayNames[mode];
}

export const AddQuestionSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
  text: z
    .string()
    .min(1, "Question text is required")
    .max(5000, "Question text is too long"),
  type: z.enum(QUESTION_TYPES),
  orderIndex: z.string().min(1, "Order index is required"),
  freeTextMode: z.enum(FREE_TEXT_MODES).nullable().optional(),
  expectedAnswer: z
    .string()
    .max(1000, "Expected answer is too long")
    .nullable()
    .optional(),
});

export const UpdateQuestionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  text: z
    .string()
    .min(1, "Question text is required")
    .max(5000, "Question text is too long")
    .optional(),
  type: z.enum(QUESTION_TYPES).optional(),
  orderIndex: z.string().min(1, "Order index is required").optional(),
  freeTextMode: z.enum(FREE_TEXT_MODES).nullable().optional(),
  expectedAnswer: z
    .string()
    .max(1000, "Expected answer is too long")
    .nullable()
    .optional(),
  imageUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
});

export const QuestionIdSchema = z.string().min(1, "Question ID is required");

export const AddChoiceSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  text: z
    .string()
    .min(1, "Choice text is required")
    .max(1000, "Choice text is too long"),
  orderIndex: z.string().min(1, "Order index is required"),
  isCorrect: z.boolean().default(false),
});

export const UpdateChoiceSchema = z.object({
  id: z.string().min(1, "Choice ID is required"),
  text: z
    .string()
    .min(1, "Choice text is required")
    .max(1000, "Choice text is too long")
    .optional(),
  orderIndex: z.string().min(1, "Order index is required").optional(),
  isCorrect: z.boolean().optional(),
  audioUrl: z.string().nullable().optional(),
});

export const ChoiceIdSchema = z.string().min(1, "Choice ID is required");

export const ReorderChoicesSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  updates: z.array(
    z.object({
      id: z.string().min(1, "Choice ID is required"),
      orderIndex: z.string().min(1, "Order index is required"),
    }),
  ),
});
