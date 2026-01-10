import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import {
  getGradedSubmissions,
  getSubmissionsNeedingGrading,
} from "@/lib/services/grading";
import { formatScore } from "@/lib/utils";
import { CheckCircle, ClipboardCheck, History } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";

async function GradingList({ userId }: { userId: string }) {
  const submissions = await getSubmissionsNeedingGrading(userId);
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">All caught up!</h3>
          <p className="text-muted-foreground">
            No submissions need manual grading at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Link
          key={submission.id}
          href={`/maker/grading/${submission.id}`}
          className="block"
        >
          <Card className="hover:border-primary transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {submission.testName}
                  </CardTitle>
                  <CardDescription>
                    Submitted by {submission.userName}
                  </CardDescription>
                </div>
                <span className="inline-flex items-center rounded-full bg-warning px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
                  {submission.ungradedCount} to grade
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Submitted{" "}
                {new Date(submission.submittedAt).toLocaleDateString()} at{" "}
                {new Date(submission.submittedAt).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function GradingListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function GradedHistory({ userId }: { userId: string }) {
  const submissions = await getGradedSubmissions(userId);
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <History className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No graded submissions yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Link
          key={submission.id}
          href={`/maker/grading/${submission.id}`}
          className="block"
        >
          <Card className="hover:border-primary transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {submission.testName}
                  </CardTitle>
                  <CardDescription>
                    Submitted by {submission.userName}
                  </CardDescription>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-0.5 text-xs font-medium text-success-foreground">
                  <CheckCircle className="w-3 h-3" />
                  {formatScore(submission.score, submission.maxScore)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Submitted{" "}
                {new Date(submission.submittedAt).toLocaleDateString()} at{" "}
                {new Date(submission.submittedAt).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function GradingDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3 mb-2">
          <ClipboardCheck className="w-7 h-7 sm:w-8 sm:h-8" />
          Grading
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review and grade free-text responses from your tests
        </p>
      </div>

      <Suspense fallback={<GradingListSkeleton />}>
        <GradingList userId={session!.user.id} />
      </Suspense>

      <div className="mt-10">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
          <History className="w-5 h-5" />
          Graded History
        </h3>
        <Suspense fallback={<GradingListSkeleton />}>
          <GradedHistory userId={session!.user.id} />
        </Suspense>
      </div>
    </div>
  );
}
