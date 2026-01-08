import { db } from "@/lib/db/drizzle";
import { answer, submission } from "@/lib/db/schema";
import type { Answer, Submission } from "@/lib/models/submission";
import { and, eq } from "drizzle-orm";

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
  const results = await db.query.submission.findMany({
    where: and(
      eq(submission.isFullyGraded, false),
      eq(submission.submittedAt, submission.submittedAt),
    ),
    with: {
      test: true,
      user: true,
      answers: true,
    },
  });

  const teacherSubmissions = results.filter(
    (s) => s.test.createdBy === teacherId && s.submittedAt !== null,
  );

  return teacherSubmissions.map((s) => ({
    id: s.id,
    testId: s.testId,
    testName: s.test.name,
    userId: s.userId,
    userName: s.user.name,
    submittedAt: s.submittedAt!,
    ungradedCount: s.answers.filter((a) => a.isCorrect === null).length,
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
