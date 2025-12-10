import { user, userRole } from "@/lib/db/schema";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export type UserRole = InferSelectModel<typeof userRole>;
export type NewUserRole = InferInsertModel<typeof userRole>;

export const ROLES = ["test_maker", "test_taker"] as const;
export type Role = (typeof ROLES)[number];
