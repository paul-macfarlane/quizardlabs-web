import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { TestCard } from "@/lib/components/test-card";
import { TestForm } from "@/lib/components/test-form";
import { getTestsByCreator } from "@/lib/services/test";
import { FileText } from "lucide-react";
import { headers } from "next/headers";
import { Suspense } from "react";

async function TestList({ userId }: { userId: string }) {
  const tests = await getTestsByCreator(userId);
  if (tests.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          No tests yet
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          Get started by creating your first test
        </p>
        <TestForm />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <TestForm />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {tests.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </div>
    </div>
  );
}

function TestListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function MakerDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Teacher Dashboard
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Create and manage your tests
        </p>
      </div>

      <Suspense fallback={<TestListSkeleton />}>
        <TestList userId={session!.user.id} />
      </Suspense>
    </div>
  );
}
