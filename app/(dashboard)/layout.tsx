import { auth } from "@/lib/auth";
import { Navbar } from "@/lib/components/navbar";
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

  return (
    <div className="min-h-screen bg-muted">
      <Navbar
        userEmail={session.user.email}
        userImage={session.user.image}
        userRole={userRole}
      />
      <main className="container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        {children}
      </main>
    </div>
  );
}
