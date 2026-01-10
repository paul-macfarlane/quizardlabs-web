import { db } from "@/lib/db/drizzle";
import { answer, submission, test, user } from "@/lib/db/schema";
import type { Answer, Submission } from "@/lib/models/submission";
import { and, desc, eq, isNotNull } from "drizzle-orm";

export interface GradingResult {
  isCorrect: boolean;
  gradedAt: Date;
  gradedBy: string | null;
}

export interface SubmissionForGrading {
  id: string;
  testId: string;
  testName: string;
  userId: string;
  userName: string;
  submittedAt: Date;
  ungradedCount: number;
}

export interface AnswerForGrading {
  id: string;
  questionId: string;
  questionText: string;
  questionType: string;
  textResponse: string | null;
  choiceId: string | null;
  choiceText: string | null;
  isCorrect: boolean | null;
}

export interface SubmissionGradingDetails {
  id: string;
  testId: string;
  testName: string;
  userId: string;
  userName: string;
  submittedAt: Date;
  score: number | null;
  maxScore: number | null;
  isFullyGraded: boolean;
  answers: AnswerForGrading[];
}

export function gradeMultiChoiceAnswer(
  selectedChoiceId: string | null,
  correctChoiceIds: string[],
): boolean {
  if (!selectedChoiceId) return false;
  return correctChoiceIds.includes(selectedChoiceId);
}

export function gradeMultiAnswerQuestion(
  selectedChoiceIds: string[],
  correctChoiceIds: string[],
): boolean {
  if (selectedChoiceIds.length !== correctChoiceIds.length) return false;

  const selectedSet = new Set(selectedChoiceIds);
  const correctSet = new Set(correctChoiceIds);

  for (const id of correctSet) {
    if (!selectedSet.has(id)) return false;
  }

  return true;
}

export function gradeFreeTextExactMatch(
  response: string | null,
  expectedAnswer: string | null,
): boolean {
  if (!response || !expectedAnswer) return false;
  return response.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();
}

export async function gradeAnswer(
  answerId: string,
  isCorrect: boolean,
  gradedBy: string,
): Promise<Answer | null> {
  const [updated] = await db
    .update(answer)
    .set({
      isCorrect,
      gradedAt: new Date(),
      gradedBy,
    })
    .where(eq(answer.id, answerId))
    .returning();

  return updated || null;
}

export async function recalculateSubmissionScore(
  submissionId: string,
): Promise<Submission | null> {
  const submissionData = await db.query.submission.findFirst({
    where: eq(submission.id, submissionId),
    with: {
      answers: true,
      test: {
        with: {
          questions: true,
        },
      },
    },
  });

  if (!submissionData) return null;

  const ungradedAnswers = submissionData.answers.filter(
    (a) => a.isCorrect === null,
  );

  const isFullyGraded = ungradedAnswers.length === 0;

  const maxScore = submissionData.test.questions.length;

  let score: number | null = null;
  if (isFullyGraded) {
    const gradedQuestionIds = new Set<string>();
    for (const a of submissionData.answers) {
      if (a.isCorrect === true && !gradedQuestionIds.has(a.questionId)) {
        gradedQuestionIds.add(a.questionId);
      }
    }
    score = gradedQuestionIds.size;
  }

  const [updated] = await db
    .update(submission)
    .set({
      score,
      maxScore,
      isFullyGraded,
    })
    .where(eq(submission.id, submissionId))
    .returning();

  return updated || null;
}

export async function getSubmissionsNeedingGrading(
  teacherId: string,
): Promise<SubmissionForGrading[]> {
  const results = await db
    .select({
      submission,
      testName: test.name,
      userName: user.name,
    })
    .from(submission)
    .innerJoin(test, eq(submission.testId, test.id))
    .innerJoin(user, eq(submission.userId, user.id))
    .where(
      and(
        eq(submission.isFullyGraded, false),
        isNotNull(submission.submittedAt),
        eq(test.createdBy, teacherId),
      ),
    )
    .orderBy(desc(submission.submittedAt));

  const submissionIds = results.map((r) => r.submission.id);
  if (submissionIds.length === 0) return [];

  const answers = await db.query.answer.findMany({
    where: (a, { inArray }) => inArray(a.submissionId, submissionIds),
  });

  const ungradedCounts = new Map<string, number>();
  for (const a of answers) {
    if (a.isCorrect === null) {
      ungradedCounts.set(
        a.submissionId,
        (ungradedCounts.get(a.submissionId) ?? 0) + 1,
      );
    }
  }

  return results.map((r) => ({
    id: r.submission.id,
    testId: r.submission.testId,
    testName: r.testName,
    userId: r.submission.userId,
    userName: r.userName,
    submittedAt: r.submission.submittedAt!,
    ungradedCount: ungradedCounts.get(r.submission.id) ?? 0,
  }));
}

export async function getSubmissionForGrading(
  submissionId: string,
): Promise<SubmissionGradingDetails | null> {
  const result = await db.query.submission.findFirst({
    where: eq(submission.id, submissionId),
    with: {
      test: {
        with: {
          questions: {
            with: {
              choices: true,
            },
          },
        },
      },
      user: true,
      answers: {
        with: {
          question: true,
          choice: true,
        },
      },
    },
  });

  if (!result || !result.submittedAt) return null;

  const answers: AnswerForGrading[] = result.answers.map((a) => ({
    id: a.id,
    questionId: a.questionId,
    questionText: a.question.text,
    questionType: a.question.type,
    textResponse: a.textResponse,
    choiceId: a.choiceId,
    choiceText: a.choice?.text || null,
    isCorrect: a.isCorrect,
  }));

  return {
    id: result.id,
    testId: result.testId,
    testName: result.test.name,
    userId: result.userId,
    userName: result.user.name,
    submittedAt: result.submittedAt,
    score: result.score,
    maxScore: result.maxScore,
    isFullyGraded: result.isFullyGraded,
    answers,
  };
}

export async function canUserGradeSubmission(
  submissionId: string,
  userId: string,
): Promise<boolean> {
  const result = await db.query.submission.findFirst({
    where: eq(submission.id, submissionId),
    with: {
      test: true,
    },
  });

  if (!result) return false;
  return result.test.createdBy === userId;
}

export async function canUserGradeAnswer(
  answerId: string,
  userId: string,
): Promise<boolean> {
  const result = await db.query.answer.findFirst({
    where: eq(answer.id, answerId),
    with: {
      submission: {
        with: {
          test: true,
        },
      },
    },
  });

  if (!result) return false;
  return result.submission.test.createdBy === userId;
}

export interface GradedSubmission {
  id: string;
  testId: string;
  testName: string;
  userId: string;
  userName: string;
  submittedAt: Date;
  score: number;
  maxScore: number;
}

export async function getGradedSubmissions(
  teacherId: string,
): Promise<GradedSubmission[]> {
  const results = await db
    .select({
      submission,
      testName: test.name,
      userName: user.name,
    })
    .from(submission)
    .innerJoin(test, eq(submission.testId, test.id))
    .innerJoin(user, eq(submission.userId, user.id))
    .where(
      and(
        eq(submission.isFullyGraded, true),
        isNotNull(submission.submittedAt),
        eq(test.createdBy, teacherId),
      ),
    )
    .orderBy(desc(submission.submittedAt));

  return results.map((r) => ({
    id: r.submission.id,
    testId: r.submission.testId,
    testName: r.testName,
    userId: r.submission.userId,
    userName: r.userName,
    submittedAt: r.submission.submittedAt!,
    score: r.submission.score ?? 0,
    maxScore: r.submission.maxScore ?? 0,
  }));
}
