import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { GradingAnswerCard } from "@/lib/components/grading-answer-card";
import { Navbar } from "@/lib/components/navbar";
import {
  canUserGradeSubmission,
  getSubmissionForGrading,
} from "@/lib/services/grading";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

const SubmissionIdSchema = z.string().min(1);

interface GradingPageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function GradingPage({ params }: GradingPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

  const { submissionId } = await params;

  const parsed = SubmissionIdSchema.safeParse(submissionId);
  if (!parsed.success) {
    notFound();
  }

  const canGrade = await canUserGradeSubmission(submissionId, session.user.id);
  if (!canGrade) {
    notFound();
  }

  const submission = await getSubmissionForGrading(submissionId);
  if (!submission) {
    notFound();
  }

  const ungradedAnswers = submission.answers.filter(
    (a) => a.isCorrect === null,
  );
  const gradedAnswers = submission.answers.filter((a) => a.isCorrect !== null);

  return (
    <>
      <Navbar userEmail={session.user.email} />
      <main className="container mx-auto px-4 py-8 pt-20 sm:pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/maker/grading">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Grading
              </Button>
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {submission.testName}
                </h1>
                <p className="text-muted-foreground">
                  Submitted by {submission.userName} on{" "}
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>

              {submission.isFullyGraded && (
                <div className="flex items-center gap-2 text-success-foreground">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {submission.score}/{submission.maxScore}
                  </span>
                </div>
              )}
            </div>
          </div>

          {ungradedAnswers.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Needs Grading</CardTitle>
                <CardDescription>
                  {ungradedAnswers.length} response
                  {ungradedAnswers.length !== 1 ? "s" : ""} need your review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ungradedAnswers.map((answer) => (
                  <GradingAnswerCard
                    key={answer.id}
                    answer={answer}
                    submissionId={submissionId}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {ungradedAnswers.length === 0 && (
            <Card className="mb-6 bg-success border-success">
              <CardContent className="py-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success-foreground" />
                <h3 className="text-lg font-medium text-success-foreground mb-2">
                  All graded!
                </h3>
                <p className="text-success-foreground/80 mb-4">
                  This submission has been fully graded.
                </p>
                <p className="text-2xl font-bold text-success-foreground">
                  Score: {submission.score}/{submission.maxScore}
                </p>
              </CardContent>
            </Card>
          )}

          {gradedAnswers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Graded Responses</CardTitle>
                <CardDescription>
                  {gradedAnswers.length} response
                  {gradedAnswers.length !== 1 ? "s" : ""} already graded
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gradedAnswers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`p-4 rounded-lg border ${
                      answer.isCorrect
                        ? "bg-success border-success"
                        : "bg-destructive/10 border-destructive/50"
                    }`}
                  >
                    <p
                      className={`font-medium mb-2 ${answer.isCorrect ? "text-success-foreground" : ""}`}
                    >
                      {answer.questionText}
                    </p>
                    <p
                      className={`text-sm ${answer.isCorrect ? "text-success-foreground/80" : ""}`}
                    >
                      Response:{" "}
                      <span className="font-mono bg-muted px-2 py-0.5 rounded">
                        {answer.textResponse ||
                          answer.choiceText ||
                          "No response"}
                      </span>
                    </p>
                    <p
                      className={`text-sm mt-2 font-medium ${
                        answer.isCorrect
                          ? "text-success-foreground"
                          : "text-destructive"
                      }`}
                    >
                      {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
