import { auth } from "@/lib/auth";
import { Navbar } from "@/lib/components/navbar";
import { getSubmissionsNeedingGrading } from "@/lib/services/grading";
import { getPrimaryUserRole } from "@/lib/services/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

  const userRole = await getPrimaryUserRole(session.user.id);
  if (!userRole) {
    redirect("/setup");
  }

  let gradingCount = 0;
  if (userRole === "test_maker") {
    const submissions = await getSubmissionsNeedingGrading(session.user.id);
    gradingCount = submissions.length;
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar
        userName={session.user.name}
        userEmail={session.user.email}
        userImage={session.user.image}
        userRole={userRole}
        gradingCount={gradingCount}
      />
      <main className="container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        {children}
      </main>
    </div>
  );
}
