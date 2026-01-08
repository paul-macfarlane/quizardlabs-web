import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { TestViewer } from "@/lib/components/test-viewer";
import { TestIdSchema } from "@/lib/models/test";
import { getQuestionsForTest } from "@/lib/services/question";
import {
  getOrCreateSubmission,
  getSubmission,
} from "@/lib/services/submission";
import { getTest } from "@/lib/services/test";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function TestContent({
  testId,
  userId,
}: {
  testId: string;
  userId: string;
}) {
  const { submission } = await getOrCreateSubmission(testId, userId);

  const [test, questions] = await Promise.all([
    getTest(testId),
    getQuestionsForTest(testId),
  ]);
  if (!test) {
    notFound();
  }

  const submissionWithAnswers = await getSubmission(submission.id);
  const initialAnswers: Record<
    string,
    { selectedChoiceIds: string[]; textResponse: string }
  > = {};

  if (submissionWithAnswers) {
    const answersByQuestion = new Map<
      string,
      { choiceIds: string[]; textResponse: string }
    >();

    for (const ans of submissionWithAnswers.answers) {
      const existing = answersByQuestion.get(ans.questionId) || {
        choiceIds: [],
        textResponse: "",
      };

      if (ans.choiceId) {
        existing.choiceIds.push(ans.choiceId);
      }
      if (ans.textResponse) {
        existing.textResponse = ans.textResponse;
      }

      answersByQuestion.set(ans.questionId, existing);
    }

    for (const [questionId, data] of answersByQuestion) {
      initialAnswers[questionId] = {
        selectedChoiceIds: data.choiceIds,
        textResponse: data.textResponse,
      };
    }
  }

  for (const question of questions) {
    if (!initialAnswers[question.id]) {
      initialAnswers[question.id] = {
        selectedChoiceIds: [],
        textResponse: "",
      };
    }
  }

  return (
    <TestViewer
      test={test}
      questions={questions}
      submission={submission}
      initialAnswers={initialAnswers}
    />
  );
}

function TestContentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

interface TestTakingPageProps {
  params: Promise<{ id: string }>;
}

export default async function TestTakingPage({ params }: TestTakingPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { id: rawId } = await params;

  const parseResult = TestIdSchema.safeParse(rawId);
  if (!parseResult.success) {
    notFound();
  }

  const testId = parseResult.data;
  const test = await getTest(testId);
  if (!test) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Suspense fallback={<TestContentSkeleton />}>
        <TestContent testId={testId} userId={session!.user.id} />
      </Suspense>
    </div>
  );
}
