import { db } from "@/lib/db/drizzle";
import { choice, question } from "@/lib/db/schema";
import {
  type Choice,
  type NewChoice,
  type NewQuestion,
  type Question,
} from "@/lib/models/question";
import { signMediaUrl } from "@/lib/services/media";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export type QuestionWithSignedUrls = Question & {
  imageSignedUrl: string | null;
  audioSignedUrl: string | null;
};

export type ChoiceWithSignedUrls = Choice & {
  audioSignedUrl: string | null;
};

export type QuestionWithChoicesAndSignedUrls = QuestionWithSignedUrls & {
  choices: ChoiceWithSignedUrls[];
};

async function signQuestionMediaUrls<T extends Question & { choices: Choice[] }>(
  q: T,
): Promise<T & { imageSignedUrl: string | null; audioSignedUrl: string | null; choices: (Choice & { audioSignedUrl: string | null })[] }> {
  const [imageSignedUrl, audioSignedUrl, ...choiceAudioSignedUrls] = await Promise.all([
    signMediaUrl(q.imageUrl),
    signMediaUrl(q.audioUrl),
    ...q.choices.map((c) => signMediaUrl(c.audioUrl)),
  ]);

  return {
    ...q,
    imageSignedUrl,
    audioSignedUrl,
    choices: q.choices.map((c, i) => ({
      ...c,
      audioSignedUrl: choiceAudioSignedUrls[i],
    })),
  };
}

export async function getQuestionsForTest(
  testId: string,
): Promise<QuestionWithChoicesAndSignedUrls[]> {
  const results = await db.query.question.findMany({
    where: eq(question.testId, testId),
    orderBy: (questions, { asc }) => [asc(questions.orderIndex)],
    with: {
      choices: {
        orderBy: (choices, { asc }) => [asc(choices.orderIndex)],
      },
    },
  });
  return Promise.all(results.map(signQuestionMediaUrls));
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
): Promise<QuestionWithChoicesAndSignedUrls | null> {
  const result = await db.query.question.findFirst({
    where: eq(question.id, questionId),
    with: {
      choices: {
        orderBy: (choices, { asc }) => [asc(choices.orderIndex)],
      },
    },
  });

  if (!result) return null;
  return signQuestionMediaUrls(result);
}

export async function addChoice(data: Omit<NewChoice, "id">): Promise<Choice> {
  const id = nanoid();
  const [newChoice] = await db
    .insert(choice)
    .values({ id, ...data })
    .returning();
  return newChoice;
}

export async function updateChoice(
  id: string,
  data: Partial<Omit<NewChoice, "id" | "questionId">>,
): Promise<Choice | null> {
  const [updatedChoice] = await db
    .update(choice)
    .set({ ...data })
    .where(eq(choice.id, id))
    .returning();
  return updatedChoice || null;
}

export async function deleteChoice(id: string): Promise<boolean> {
  const result = await db.delete(choice).where(eq(choice.id, id));
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function reorderChoices(
  updates: Array<{ id: string; orderIndex: string }>,
): Promise<boolean> {
  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .update(choice)
        .set({ orderIndex: update.orderIndex })
        .where(eq(choice.id, update.id));
    }
  });
  return true;
}

export async function getChoiceWithQuestion(
  choiceId: string,
): Promise<(Choice & { question: Question }) | null> {
  const result = await db.query.choice.findFirst({
    where: eq(choice.id, choiceId),
    with: {
      question: true,
    },
  });
  return result || null;
}

export async function getChoiceWithQuestionAndChoices(
  choiceId: string,
): Promise<(Choice & { question: Question & { choices: Choice[] } }) | null> {
  const result = await db.query.choice.findFirst({
    where: eq(choice.id, choiceId),
    with: {
      question: {
        with: {
          choices: true,
        },
      },
    },
  });
  return result || null;
}
