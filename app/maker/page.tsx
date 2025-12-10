import { auth } from "@/lib/auth";
import { SignOut } from "@/lib/components/sign-out";
import { FileText } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MakerDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted">
      <nav className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Quizardlabs</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <SignOut />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Teacher Dashboard
            </h2>
            <p className="text-muted-foreground">
              Create and manage your tests
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <FileText className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tests yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first test
            </p>
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Create Test (Coming in Feature 3)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
