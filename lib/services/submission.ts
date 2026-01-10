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

  const sorted = (results as SubmissionWithTestInfo[]).sort((a, b) => {
    const aInProgress = a.submittedAt === null;
    const bInProgress = b.submittedAt === null;

    if (aInProgress && !bInProgress) return -1;
    if (!aInProgress && bInProgress) return 1;

    return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
  });

  return sorted;
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
  const submissionData = await db.query.submission.findFirst({
    where: eq(submission.id, submissionId),
    with: {
      answers: true,
      test: {
        with: {
          questions: {
            with: {
              choices: true,
            },
          },
        },
      },
    },
  });

  if (!submissionData) return null;

  const now = new Date();
  const allQuestions = submissionData.test.questions;
  const questionsMap = new Map(allQuestions.map((q) => [q.id, q]));

  const answersByQuestion = new Map<string, typeof submissionData.answers>();
  for (const ans of submissionData.answers) {
    const existing = answersByQuestion.get(ans.questionId) || [];
    existing.push(ans);
    answersByQuestion.set(ans.questionId, existing);
  }

  const unansweredQuestions: string[] = [];
  for (const question of allQuestions) {
    const questionAnswers = answersByQuestion.get(question.id);
    if (!questionAnswers || questionAnswers.length === 0) {
      unansweredQuestions.push(question.id);
      continue;
    }

    if (question.type === "free_text") {
      const hasText = questionAnswers.some(
        (a) => a.textResponse && a.textResponse.trim() !== "",
      );
      if (!hasText) {
        unansweredQuestions.push(question.id);
      }
    } else {
      const hasChoice = questionAnswers.some((a) => a.choiceId !== null);
      if (!hasChoice) {
        unansweredQuestions.push(question.id);
      }
    }
  }

  if (unansweredQuestions.length > 0) {
    throw new Error(
      `Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remain unanswered.`,
    );
  }

  let hasUngradedAnswers = false;

  await db.transaction(async (tx) => {
    for (const [questionId, questionAnswers] of answersByQuestion) {
      const question = questionsMap.get(questionId);
      if (!question) continue;

      if (question.type === "multi_choice") {
        const selectedChoiceId = questionAnswers[0]?.choiceId;
        const correctChoiceIds = question.choices
          .filter((c) => c.isCorrect)
          .map((c) => c.id);

        const isCorrect = selectedChoiceId
          ? correctChoiceIds.includes(selectedChoiceId)
          : false;

        for (const ans of questionAnswers) {
          await tx
            .update(answer)
            .set({ isCorrect, gradedAt: now, gradedBy: null })
            .where(eq(answer.id, ans.id));
        }
      } else if (question.type === "multi_answer") {
        const selectedChoiceIds = questionAnswers
          .map((a) => a.choiceId)
          .filter((id): id is string => id !== null);
        const correctChoiceIds = question.choices
          .filter((c) => c.isCorrect)
          .map((c) => c.id);

        const selectedSet = new Set(selectedChoiceIds);
        const correctSet = new Set(correctChoiceIds);

        const isCorrect =
          selectedSet.size === correctSet.size &&
          [...correctSet].every((id) => selectedSet.has(id));

        for (const ans of questionAnswers) {
          await tx
            .update(answer)
            .set({ isCorrect, gradedAt: now, gradedBy: null })
            .where(eq(answer.id, ans.id));
        }
      } else if (question.type === "free_text") {
        if (
          question.freeTextMode === "exact_match" &&
          question.expectedAnswer
        ) {
          const response = questionAnswers[0]?.textResponse;
          const isCorrect = response
            ? response.toLowerCase().trim() ===
              question.expectedAnswer.toLowerCase().trim()
            : false;

          for (const ans of questionAnswers) {
            await tx
              .update(answer)
              .set({ isCorrect, gradedAt: now, gradedBy: null })
              .where(eq(answer.id, ans.id));
          }
        } else {
          hasUngradedAnswers = true;
        }
      }
    }
  });

  const maxScore = submissionData.test.questions.length;

  const [updated] = await db
    .update(submission)
    .set({
      submittedAt: now,
      maxScore,
      isFullyGraded: !hasUngradedAnswers,
      score: hasUngradedAnswers ? null : undefined,
    })
    .where(eq(submission.id, submissionId))
    .returning();

  if (updated && !hasUngradedAnswers) {
    const { recalculateSubmissionScore } = await import("./grading");
    await recalculateSubmissionScore(submissionId);
    const [final] = await db
      .select()
      .from(submission)
      .where(eq(submission.id, submissionId));
    return final as Submission;
  }

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
