import { db } from "@/lib/db/drizzle";
import { test } from "@/lib/db/schema";
import { type NewTest, type Test } from "@/lib/models/test";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function createTest(
  data: Omit<NewTest, "id" | "createdAt" | "updatedAt">,
): Promise<Test> {
  const newTest: NewTest = {
    id: nanoid(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [created] = await db.insert(test).values(newTest).returning();
  return created as Test;
}

export async function getTestsByCreator(userId: string): Promise<Test[]> {
  return await db
    .select()
    .from(test)
    .where(eq(test.createdBy, userId))
    .orderBy(desc(test.createdAt));
}

export async function getTest(id: string): Promise<Test | null> {
  const results = await db.select().from(test).where(eq(test.id, id)).limit(1);
  return results.length > 0 ? (results[0] as Test) : null;
}

export async function updateTest(
  id: string,
  data: Partial<Pick<Test, "name" | "description">>,
): Promise<Test | null> {
  const [updated] = await db
    .update(test)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(test.id, id))
    .returning();

  return updated ? (updated as Test) : null;
}

export async function deleteTest(id: string): Promise<boolean> {
  const result = await db.delete(test).where(eq(test.id, id));
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function canUserAccessTest(
  testId: string,
  userId: string,
): Promise<boolean> {
  const results = await db
    .select()
    .from(test)
    .where(and(eq(test.id, testId), eq(test.createdBy, userId)))
    .limit(1);

  return results.length > 0;
}
