import { auth } from "@/lib/auth";
import { SignIn } from "@/lib/components/sign-in";
import { SignOut } from "@/lib/components/sign-out";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div>
      {session && (
        <div>
          <p>Logged in as {session.user.email}</p>
          <SignOut />
        </div>
      )}
      {!session && <SignIn />}
    </div>
  );
}
