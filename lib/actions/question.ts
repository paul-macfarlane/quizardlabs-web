"use server";

import {
  AddChoiceSchema,
  AddQuestionSchema,
  type Choice,
  ChoiceIdSchema,
  type Question,
  QuestionIdSchema,
  ReorderChoicesSchema,
  UpdateChoiceSchema,
  UpdateQuestionSchema,
} from "@/lib/models/question";
import {
  addChoice,
  addQuestion,
  deleteChoice,
  deleteQuestion,
  getChoiceWithQuestion,
  getChoiceWithQuestionAndChoices,
  getQuestionWithChoices,
  reorderChoices,
  updateChoice,
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

export interface AddChoiceResult {
  data?: Choice;
  error?: string;
}

export async function addChoiceAction(
  input: unknown,
): Promise<AddChoiceResult> {
  try {
    const validated = AddChoiceSchema.parse(input);

    const questionData = await getQuestionWithChoices(validated.questionId);
    if (!questionData) {
      return { error: "Question not found" };
    }

    const user = await getCurrentUser();
    if (!(await canUserAccessTest(questionData.testId, user.id))) {
      return { error: "Access denied" };
    }

    if (validated.isCorrect && questionData.type === "multi_choice") {
      const hasCorrectChoice = questionData.choices.some((c) => c.isCorrect);
      if (hasCorrectChoice) {
        return {
          error:
            "Multi-choice questions can only have one correct answer. Please unmark the existing correct choice first.",
        };
      }
    }

    const newChoice = await addChoice(validated);

    revalidatePath(`/maker/test/${questionData.testId}`);
    return { data: newChoice };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid choice data" };
    }
    return {
      error: error instanceof Error ? error.message : "Failed to add choice",
    };
  }
}

export interface UpdateChoiceResult {
  data?: Choice;
  error?: string;
}

export async function updateChoiceAction(
  input: unknown,
): Promise<UpdateChoiceResult> {
  try {
    const validated = UpdateChoiceSchema.parse(input);
    const { id: choiceId, ...updateData } = validated;

    const choiceData = await getChoiceWithQuestionAndChoices(choiceId);
    if (!choiceData) {
      return { error: "Choice not found" };
    }

    const user = await getCurrentUser();
    if (!(await canUserAccessTest(choiceData.question.testId, user.id))) {
      return { error: "Access denied" };
    }

    if (
      updateData.isCorrect === true &&
      choiceData.question.type === "multi_choice"
    ) {
      const otherCorrectChoices = choiceData.question.choices.filter(
        (c) => c.id !== choiceId && c.isCorrect,
      );

      if (otherCorrectChoices.length > 0) {
        return {
          error:
            "Multi-choice questions can only have one correct answer. Please unmark other choices first.",
        };
      }
    }

    const updatedChoice = await updateChoice(choiceId, updateData);
    if (!updatedChoice) {
      return { error: "Choice not found" };
    }

    revalidatePath(`/maker/test/${choiceData.question.testId}`);
    return { data: updatedChoice };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid choice data" };
    }
    return {
      error: error instanceof Error ? error.message : "Failed to update choice",
    };
  }
}

export interface DeleteChoiceResult {
  error?: string;
}

export async function deleteChoiceAction(
  input: unknown,
): Promise<DeleteChoiceResult> {
  try {
    const choiceId = ChoiceIdSchema.parse(input);

    const choiceData = await getChoiceWithQuestion(choiceId);
    if (!choiceData) {
      return { error: "Choice not found" };
    }

    const user = await getCurrentUser();
    if (!(await canUserAccessTest(choiceData.question.testId, user.id))) {
      return { error: "Access denied" };
    }

    const deleted = await deleteChoice(choiceId);
    if (!deleted) {
      return { error: "Choice not found" };
    }

    revalidatePath(`/maker/test/${choiceData.question.testId}`);
    return { error: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid choice ID" };
    }
    return {
      error: error instanceof Error ? error.message : "Failed to delete choice",
    };
  }
}

export interface ReorderChoicesResult {
  error?: string;
}

export async function reorderChoicesAction(
  input: unknown,
): Promise<ReorderChoicesResult> {
  try {
    const validated = ReorderChoicesSchema.parse(input);

    const questionData = await getQuestionWithChoices(validated.questionId);
    if (!questionData) {
      return { error: "Question not found" };
    }

    const user = await getCurrentUser();
    if (!(await canUserAccessTest(questionData.testId, user.id))) {
      return { error: "Access denied" };
    }

    const questionChoiceIds = new Set(questionData.choices.map((c) => c.id));
    const updateChoiceIds = validated.updates.map((u) => u.id);

    const allChoicesValid = updateChoiceIds.every((id) =>
      questionChoiceIds.has(id),
    );
    if (!allChoicesValid) {
      return {
        error: "Invalid choice IDs: all choices must belong to this question",
      };
    }

    await reorderChoices(validated.updates);

    revalidatePath(`/maker/test/${questionData.testId}`);
    return { error: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid reorder data" };
    }
    return {
      error:
        error instanceof Error ? error.message : "Failed to reorder choices",
    };
  }
}
