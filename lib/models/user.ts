import { user, userRole } from "@/lib/db/schema";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { z } from "zod";

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export type UserRole = InferSelectModel<typeof userRole>;
export type NewUserRole = InferInsertModel<typeof userRole>;

export const ROLES = ["test_maker", "test_taker"] as const;
export type Role = (typeof ROLES)[number];

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  image: z.string().url().nullable().optional(),
});
