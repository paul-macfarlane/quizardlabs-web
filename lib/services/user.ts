import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { userRole } from "@/lib/db/schema";
import { type NewUserRole, type Role, type UserRole } from "@/lib/models/user";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";

export async function getPrimaryUserRole(userId: string): Promise<Role | null> {
  const roles = await db
    .select()
    .from(userRole)
    .where(eq(userRole.userId, userId))
    .orderBy(userRole.createdAt)
    .limit(1);

  return roles.length > 0 ? (roles[0].role as Role) : null;
}

export async function setUserRole(
  userId: string,
  role: Role,
): Promise<UserRole> {
  return await db.transaction(async (tx) => {
    await tx.delete(userRole).where(eq(userRole.userId, userId));

    const newRole: NewUserRole = {
      id: nanoid(),
      userId,
      role,
      createdAt: new Date(),
    };

    const [created] = await tx.insert(userRole).values(newRole).returning();
    return created as UserRole;
  });
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Not authenticated");
  }

  return session.user;
}
