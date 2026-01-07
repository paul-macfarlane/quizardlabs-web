import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { Navbar } from "@/lib/components/navbar";
import { TestViewer } from "@/lib/components/test-viewer";
import { SubmissionIdSchema } from "@/lib/models/submission";
import { getQuestionsForTest } from "@/lib/services/question";
import {
  canUserAccessSubmission,
  getSubmission,
} from "@/lib/services/submission";
import { getTest } from "@/lib/services/test";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

interface SubmissionPageProps {
  params: Promise<{ id: string }>;
}

async function SubmissionContent({ submissionId }: { submissionId: string }) {
  const submissionWithAnswers = await getSubmission(submissionId);
  if (!submissionWithAnswers) {
    notFound();
  }

  const [test, questions] = await Promise.all([
    getTest(submissionWithAnswers.testId),
    getQuestionsForTest(submissionWithAnswers.testId),
  ]);

  if (!test) {
    notFound();
  }

  const initialAnswers: Record<
    string,
    { selectedChoiceIds: string[]; textResponse: string }
  > = {};

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

  for (const question of questions) {
    if (!initialAnswers[question.id]) {
      initialAnswers[question.id] = {
        selectedChoiceIds: [],
        textResponse: "",
      };
    }
  }

  const isCompleted = submissionWithAnswers.submittedAt !== null;

  return (
    <>
      {isCompleted && (
        <div className="mb-4 flex justify-end">
          <Link href={`/test/${test.id}`} prefetch={false}>
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Test
            </Button>
          </Link>
        </div>
      )}

      <TestViewer
        test={test}
        questions={questions}
        submission={submissionWithAnswers}
        initialAnswers={initialAnswers}
      />
    </>
  );
}

function SubmissionContentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default async function SubmissionPage({ params }: SubmissionPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

  const { id: rawId } = await params;

  const parseResult = SubmissionIdSchema.safeParse(rawId);
  if (!parseResult.success) {
    notFound();
  }

  const submissionId = parseResult.data;

  if (!(await canUserAccessSubmission(submissionId, session.user.id))) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar userEmail={session.user.email} />

      <main className="container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link href="/taker">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <Suspense fallback={<SubmissionContentSkeleton />}>
            <SubmissionContent submissionId={submissionId} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
