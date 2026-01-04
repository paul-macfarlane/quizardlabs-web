"use server";

import {
  type MediaType,
  type MediaUploadResult,
  deleteMedia,
  generateMediaUploadUrl,
} from "@/lib/services/media";
import {
  getChoiceWithQuestionAndChoices,
  getQuestionWithChoices,
} from "@/lib/services/question";
import { canUserAccessTest } from "@/lib/services/test";
import { getCurrentUser } from "@/lib/services/user";
import { z } from "zod";

const GetUploadUrlSchema = z.object({
  type: z.enum(["question_image", "question_audio", "choice_audio"]),
  testId: z.string().min(1, "Test ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
  choiceId: z.string().optional(),
  contentType: z.string().min(1, "Content type is required"),
});

export interface GetUploadUrlResult {
  data?: MediaUploadResult;
  error?: string;
}

export async function getMediaUploadUrlAction(
  input: unknown,
): Promise<GetUploadUrlResult> {
  try {
    const validated = GetUploadUrlSchema.parse(input);

    const user = await getCurrentUser();

    if (!(await canUserAccessTest(validated.testId, user.id))) {
      return { error: "Access denied" };
    }

    const question = await getQuestionWithChoices(validated.questionId);
    if (!question || question.testId !== validated.testId) {
      return { error: "Question not found" };
    }

    if (validated.type === "choice_audio") {
      if (!validated.choiceId) {
        return { error: "Choice ID is required for choice audio" };
      }
      const choice = question.choices.find((c) => c.id === validated.choiceId);
      if (!choice) {
        return { error: "Choice not found" };
      }
    }

    const result = await generateMediaUploadUrl({
      type: validated.type as MediaType,
      testId: validated.testId,
      questionId: validated.questionId,
      choiceId: validated.choiceId,
      contentType: validated.contentType,
    });

    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid upload parameters" };
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate upload URL",
    };
  }
}

const DeleteMediaSchema = z.object({
  type: z.enum(["question_image", "question_audio", "choice_audio"]),
  questionId: z.string().min(1, "Question ID is required"),
  choiceId: z.string().optional(),
});

export interface DeleteMediaResult {
  error?: string;
}

export async function deleteMediaAction(
  input: unknown,
): Promise<DeleteMediaResult> {
  try {
    const validated = DeleteMediaSchema.parse(input);

    const user = await getCurrentUser();

    if (validated.type === "choice_audio") {
      if (!validated.choiceId) {
        return { error: "Choice ID is required for choice audio" };
      }

      const choice = await getChoiceWithQuestionAndChoices(validated.choiceId);
      if (!choice || choice.questionId !== validated.questionId) {
        return { error: "Choice not found" };
      }

      if (!(await canUserAccessTest(choice.question.testId, user.id))) {
        return { error: "Access denied" };
      }

      if (!choice.audioUrl) {
        return { error: "No audio to delete" };
      }

      await deleteMedia(choice.audioUrl);
      return {};
    }

    const question = await getQuestionWithChoices(validated.questionId);
    if (!question) {
      return { error: "Question not found" };
    }

    if (!(await canUserAccessTest(question.testId, user.id))) {
      return { error: "Access denied" };
    }

    const key =
      validated.type === "question_image"
        ? question.imageUrl
        : question.audioUrl;

    if (!key) {
      return { error: "No media to delete" };
    }

    await deleteMedia(key);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid parameters" };
    }
    return {
      error: error instanceof Error ? error.message : "Failed to delete media",
    };
  }
}
