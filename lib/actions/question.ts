"use server";

import {
  AddQuestionSchema,
  type Question,
  QuestionIdSchema,
  UpdateQuestionSchema,
} from "@/lib/models/question";
import {
  addQuestion,
  deleteQuestion,
  getQuestionWithChoices,
  updateQuestion,
} from "@/lib/services/question";
import { canUserAccessTest } from "@/lib/services/test";
import { getCurrentUser } from "@/lib/services/user";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface AddQuestionResult {
  data?: Question;
  error?: string;
}

export async function addQuestionAction(
  input: unknown,
): Promise<AddQuestionResult> {
  try {
    const validated = AddQuestionSchema.parse(input);

    const user = await getCurrentUser();
    if (!(await canUserAccessTest(validated.testId, user.id))) {
      return { error: "Access denied" };
    }

    const question = await addQuestion(validated);

    revalidatePath(`/maker/test/${validated.testId}`);
    return { data: question };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid question data" };
    }
    return {
      error: error instanceof Error ? error.message : "Failed to add question",
    };
  }
}

export interface UpdateQuestionResult {
  data?: Question;
  error?: string;
}

export async function updateQuestionAction(
  input: unknown,
): Promise<UpdateQuestionResult> {
  try {
    const validated = UpdateQuestionSchema.parse(input);
    const { id: questionId, ...updateData } = validated;

    const questionData = await getQuestionWithChoices(questionId);
    if (!questionData) {
      return { error: "Question not found" };
    }

    const user = await getCurrentUser();
    if (!(await canUserAccessTest(questionData.testId, user.id))) {
      return { error: "Access denied" };
    }

    const question = await updateQuestion(questionId, updateData);
    if (!question) {
      return { error: "Question not found" };
    }

    revalidatePath(`/maker/test/${questionData.testId}`);
    return { data: question };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid question data" };
    }
    return {
      error:
        error instanceof Error ? error.message : "Failed to update question",
    };
  }
}

export interface DeleteQuestionResult {
  error?: string;
}

export async function deleteQuestionAction(
  input: unknown,
): Promise<DeleteQuestionResult> {
  try {
    const questionId = QuestionIdSchema.parse(input);

    const questionData = await getQuestionWithChoices(questionId);
    if (!questionData) {
      return { error: "Question not found" };
    }

    const user = await getCurrentUser();
    if (!(await canUserAccessTest(questionData.testId, user.id))) {
      return { error: "Access denied" };
    }

    const deleted = await deleteQuestion(questionId);
    if (!deleted) {
      return { error: "Question not found" };
    }

    revalidatePath(`/maker/test/${questionData.testId}`);
    return { error: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid question ID" };
    }
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete question",
    };
  }
}
