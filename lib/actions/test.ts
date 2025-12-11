"use server";

import {
  CreateTestSchema,
  type Test,
  TestIdSchema,
  UpdateTestSchema,
} from "@/lib/models/test";
import {
  canUserAccessTest,
  createTest,
  deleteTest,
  getTest,
  getTestsByCreator,
  updateTest,
} from "@/lib/services/test";
import { getCurrentUser } from "@/lib/services/user";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface CreateTestResult {
  data?: Test;
  error?: string;
}

export async function createTestAction(
  input: unknown,
): Promise<CreateTestResult> {
  try {
    const validated = CreateTestSchema.parse(input);
    const user = await getCurrentUser();

    const test = await createTest({
      createdBy: user.id,
      ...validated,
    });

    revalidatePath("/maker");
    return { data: test };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid test data" };
    }

    return {
      error: error instanceof Error ? error.message : "Failed to create test",
    };
  }
}

export interface GetTestsResult {
  data?: Test[];
  error?: string;
}

export async function getMyTestsAction(): Promise<GetTestsResult> {
  try {
    const user = await getCurrentUser();
    const tests = await getTestsByCreator(user.id);
    return { data: tests };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to fetch tests",
    };
  }
}

export interface GetTestResult {
  data?: Test;
  error?: string;
}

export async function getTestAction(input: unknown): Promise<GetTestResult> {
  try {
    const id = TestIdSchema.parse(input);
    const user = await getCurrentUser();

    const test = await getTest(id);
    if (!test) {
      return { error: "Test not found" };
    }

    if (!(await canUserAccessTest(id, user.id))) {
      return { error: "Access denied" };
    }

    return { data: test };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid test ID" };
    }

    return {
      error: error instanceof Error ? error.message : "Failed to fetch test",
    };
  }
}

export interface UpdateTestResult {
  data?: Test;
  error?: string;
}

export async function updateTestAction(
  data: unknown,
): Promise<UpdateTestResult> {
  try {
    const validated = UpdateTestSchema.parse(data);
    const { id: testId, ...updateData } = validated;

    const user = await getCurrentUser();
    if (!(await canUserAccessTest(testId, user.id))) {
      return { error: "Access denied" };
    }

    const test = await updateTest(testId, updateData);
    if (!test) {
      return { error: "Test not found" };
    }

    revalidatePath("/maker");
    revalidatePath(`/maker/test/${testId}`);
    return { data: test };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid test data" };
    }

    return {
      error: error instanceof Error ? error.message : "Failed to update test",
    };
  }
}

export interface DeleteTestResult {
  error?: string;
}

export async function deleteTestAction(
  input: unknown,
): Promise<DeleteTestResult> {
  try {
    const id = TestIdSchema.parse(input);

    const user = await getCurrentUser();
    if (!(await canUserAccessTest(id, user.id))) {
      return { error: "Access denied" };
    }

    const deleted = await deleteTest(id);

    if (!deleted) {
      return { error: "Test not found" };
    }

    revalidatePath("/maker");
    revalidatePath(`/maker/test/${id}`);
    return { error: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid test ID" };
    }

    return {
      error: error instanceof Error ? error.message : "Failed to delete test",
    };
  }
}
