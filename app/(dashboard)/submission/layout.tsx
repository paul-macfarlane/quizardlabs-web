import { auth } from "@/lib/auth";
import { getPrimaryUserRole } from "@/lib/services/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SubmissionLayout({
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
  if (userRole !== "test_taker") {
    redirect("/maker");
  }

  return <>{children}</>;
}
