import { auth } from "@/lib/auth";
import { RoleSelector } from "@/lib/components/role-selector";
import { getPrimaryUserRole } from "@/lib/services/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

  const primaryRole = await getPrimaryUserRole(session.user.id);
  if (primaryRole) {
    if (primaryRole === "test_maker") {
      redirect("/maker");
    } else {
      redirect("/taker");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <RoleSelector />
    </div>
  );
}
