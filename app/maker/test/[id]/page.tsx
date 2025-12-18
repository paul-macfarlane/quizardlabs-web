import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { Navbar } from "@/lib/components/navbar";
import { QuestionCard } from "@/lib/components/question-card";
import { QuestionForm } from "@/lib/components/question-form";
import { TestForm } from "@/lib/components/test-form";
import { TestIdSchema } from "@/lib/models/test";
import { getQuestionsForTest } from "@/lib/services/question";
import { getTest } from "@/lib/services/test";
import { ArrowLeft, Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

interface TestEditorPageProps {
  params: Promise<{ id: string }>;
}

async function QuestionList({ testId }: { testId: string }) {
  const questions = await getQuestionsForTest(testId);
  if (questions.length === 0) {
    return (
      <>
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-muted-foreground">
            No questions yet. Add your first question to get started.
          </p>
        </div>

        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <QuestionForm
            testId={testId}
            questionCount={0}
            trigger={
              <Button
                size="lg"
                className="rounded-full shadow-lg hover:shadow-xl transition-shadow gap-2 h-12 px-4 sm:h-14 sm:px-6"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base">
                  Add Question
                </span>
              </Button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-4 pb-24">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            questionNumber={index + 1}
            questionCount={questions.length}
            testId={testId}
          />
        ))}
      </div>

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <QuestionForm
          testId={testId}
          questionCount={questions.length}
          trigger={
            <Button
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl transition-shadow gap-2 h-12 px-4 sm:h-14 sm:px-6"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium text-sm sm:text-base">
                Add Question
              </span>
            </Button>
          }
        />
      </div>
    </>
  );
}

function QuestionListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default async function TestEditorPage({ params }: TestEditorPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

  const { id: rawId } = await params;

  const parseResult = TestIdSchema.safeParse(rawId);
  if (!parseResult.success) {
    notFound();
  }

  const id = parseResult.data;

  const test = await getTest(id);
  if (!test || test.createdBy !== session.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar userEmail={session.user.email} />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Link href="/maker">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
                <span className="xs:hidden">Back</span>
              </Button>
            </Link>
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 wrap-break-word">
                  {test.name}
                </h1>
                {test.description && (
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {test.description}
                  </p>
                )}
              </div>
              <TestForm
                test={test}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Edit Details
                  </Button>
                }
              />
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Questions</CardTitle>
              <CardDescription className="text-sm">
                Add and manage questions for this test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<QuestionListSkeleton />}>
                <QuestionList testId={id} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
