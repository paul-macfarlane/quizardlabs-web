import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Navbar } from "@/lib/components/navbar";
import { TestForm } from "@/lib/components/test-form";
import { TestIdSchema } from "@/lib/models/test";
import { getTest } from "@/lib/services/test";
import { ArrowLeft, Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface TestEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function TestEditorPage({ params }: TestEditorPageProps) {
  const { id: rawId } = await params;

  const parseResult = TestIdSchema.safeParse(rawId);
  if (!parseResult.success) {
    notFound();
  }

  const id = parseResult.data;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

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
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  No questions yet. Questions will be added in Feature 4.
                </p>
                <Button disabled size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
