import { auth } from "@/lib/auth";
import { Navbar } from "@/lib/components/navbar";
import { ClipboardCheck } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Student Dashboard
            </h2>
            <p className="text-muted-foreground">Access your assigned tests</p>
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <ClipboardCheck className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tests available
            </h3>
            <p className="text-muted-foreground">
              Tests will appear here when your teacher assigns them
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
