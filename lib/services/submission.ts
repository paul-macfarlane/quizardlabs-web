import { db } from "@/lib/db/drizzle";
import { answer, submission } from "@/lib/db/schema";
import type {
  Answer,
  NewAnswer,
  NewSubmission,
  Submission,
} from "@/lib/models/submission";
import { and, desc, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

export type SubmissionWithAnswers = Submission & {
  answers: Answer[];
};

export type SubmissionWithTestInfo = Submission & {
  test: {
    id: string;
    name: string;
    description: string | null;
  };
};

export async function createSubmission(
  testId: string,
  userId: string,
): Promise<Submission> {
  const newSubmission: NewSubmission = {
    id: nanoid(),
    testId,
    userId,
    startedAt: new Date(),
    submittedAt: null,
    createdAt: new Date(),
  };

  const [created] = await db
    .insert(submission)
    .values(newSubmission)
    .returning();
  return created as Submission;
}

export async function getSubmission(
  submissionId: string,
): Promise<SubmissionWithAnswers | null> {
  const result = await db.query.submission.findFirst({
    where: eq(submission.id, submissionId),
    with: {
      answers: true,
    },
  });
  return result || null;
}

export async function getActiveSubmission(
  testId: string,
  userId: string,
): Promise<Submission | null> {
  const result = await db
    .select()
    .from(submission)
    .where(
      and(
        eq(submission.testId, testId),
        eq(submission.userId, userId),
        isNull(submission.submittedAt),
      ),
    )
    .limit(1);

  return result.length > 0 ? (result[0] as Submission) : null;
}

export async function getSubmissionsByUser(
  userId: string,
): Promise<SubmissionWithTestInfo[]> {
  const results = await db.query.submission.findMany({
    where: eq(submission.userId, userId),
    with: {
      test: {
        columns: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: [desc(submission.startedAt)],
  });
  return results as SubmissionWithTestInfo[];
}

export async function getOrCreateSubmission(
  testId: string,
  userId: string,
): Promise<{ submission: Submission; isNew: boolean }> {
  const active = await getActiveSubmission(testId, userId);
  if (active) {
    return { submission: active, isNew: false };
  }

  const newSubmission = await createSubmission(testId, userId);
  return { submission: newSubmission, isNew: true };
}

export async function saveAnswer(
  submissionId: string,
  questionId: string,
  data: {
    choiceIds?: string[];
    textResponse?: string;
  },
): Promise<Answer[]> {
  return await db.transaction(async (tx) => {
    await tx
      .delete(answer)
      .where(
        and(
          eq(answer.submissionId, submissionId),
          eq(answer.questionId, questionId),
        ),
      );

    if (!data.choiceIds?.length && !data.textResponse) {
      return [];
    }

    const answers: Answer[] = [];

    if (data.choiceIds && data.choiceIds.length > 0) {
      for (const choiceId of data.choiceIds) {
        const newAnswer: NewAnswer = {
          id: nanoid(),
          submissionId,
          questionId,
          choiceId,
          textResponse: null,
          createdAt: new Date(),
        };

        const [created] = await tx.insert(answer).values(newAnswer).returning();
        answers.push(created as Answer);
      }
    }

    if (data.textResponse) {
      const newAnswer: NewAnswer = {
        id: nanoid(),
        submissionId,
        questionId,
        choiceId: null,
        textResponse: data.textResponse,
        createdAt: new Date(),
      };

      const [created] = await tx.insert(answer).values(newAnswer).returning();
      answers.push(created as Answer);
    }

    return answers;
  });
}

export async function submitSubmission(
  submissionId: string,
): Promise<Submission | null> {
  const [updated] = await db
    .update(submission)
    .set({ submittedAt: new Date() })
    .where(eq(submission.id, submissionId))
    .returning();

  return updated ? (updated as Submission) : null;
}

export async function canUserAccessSubmission(
  submissionId: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .select()
    .from(submission)
    .where(and(eq(submission.id, submissionId), eq(submission.userId, userId)))
    .limit(1);

  return result.length > 0;
}

export async function isSubmissionInProgress(
  submissionId: string,
): Promise<boolean> {
  const result = await db
    .select()
    .from(submission)
    .where(and(eq(submission.id, submissionId), isNull(submission.submittedAt)))
    .limit(1);

  return result.length > 0;
}

export async function getAnswersByQuestion(
  submissionId: string,
): Promise<Map<string, Answer[]>> {
  const answers = await db
    .select()
    .from(answer)
    .where(eq(answer.submissionId, submissionId));

  const grouped = new Map<string, Answer[]>();
  for (const ans of answers) {
    const existing = grouped.get(ans.questionId) || [];
    existing.push(ans as Answer);
    grouped.set(ans.questionId, existing);
  }

  return grouped;
}
