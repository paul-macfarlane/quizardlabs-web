import { db } from "@/lib/db/drizzle";
import { question } from "@/lib/db/schema";
import {
  type Choice,
  type NewQuestion,
  type Question,
} from "@/lib/models/question";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getQuestionsForTest(testId: string): Promise<Question[]> {
  return await db
    .select()
    .from(question)
    .where(eq(question.testId, testId))
    .orderBy(question.orderIndex);
}

export async function addQuestion(
  data: Omit<NewQuestion, "id">,
): Promise<Question> {
  const id = nanoid();
  const [newQuestion] = await db
    .insert(question)
    .values({ id, ...data })
    .returning();
  return newQuestion;
}

export async function updateQuestion(
  id: string,
  data: Partial<Omit<NewQuestion, "id" | "testId">>,
): Promise<Question | null> {
  const [updatedQuestion] = await db
    .update(question)
    .set({ ...data })
    .where(eq(question.id, id))
    .returning();
  return updatedQuestion || null;
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const result = await db.delete(question).where(eq(question.id, id));
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function getQuestionWithChoices(
  questionId: string,
): Promise<(Question & { choices: Choice[] }) | null> {
  const result = await db.query.question.findFirst({
    where: eq(question.id, questionId),
    with: {
      choices: {
        orderBy: (choices, { asc }) => [asc(choices.orderIndex)],
      },
    },
  });

  return result || null;
}
