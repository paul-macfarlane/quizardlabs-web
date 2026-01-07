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
import { SubmissionCard } from "@/lib/components/submission-card";
import { getSubmissionsByUser } from "@/lib/services/submission";
import { ClipboardCheck } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { TestLinkForm } from "./test-link-form";

async function SubmissionHistory({ userId }: { userId: string }) {
  const submissions = await getSubmissionsByUser(userId);

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No tests taken yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {submissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  );
}

function SubmissionHistorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export default async function TakerDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar userEmail={session.user.email} />

      <main className="container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Student Dashboard
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Enter a test link or view your submission history
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Take a Test</CardTitle>
              <CardDescription>
                Enter a test link or ID shared by your teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestLinkForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Tests</CardTitle>
              <CardDescription>
                Tests you have started or completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SubmissionHistorySkeleton />}>
                <SubmissionHistory userId={session.user.id} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
