import { test } from "@/lib/db/schema";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { z } from "zod";

export type Test = InferSelectModel<typeof test>;
export type NewTest = InferInsertModel<typeof test>;

export const CreateTestSchema = z.object({
  name: z.string().min(1, "Test name is required").max(255),
  description: z.string().optional(),
});

export const UpdateTestSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Test name is required").max(255).optional(),
  description: z.string().optional(),
});

export const TestIdSchema = z.string().min(1, "Test ID is required");
