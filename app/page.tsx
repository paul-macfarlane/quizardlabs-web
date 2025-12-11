import { auth } from "@/lib/auth";
import { SignIn } from "@/lib/components/sign-in";
import { getPrimaryUserRole } from "@/lib/services/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Quizardlabs
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Digital tests with teacher-recorded audio
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-t pt-4 sm:pt-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
                For Teachers
              </h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Create digital tests with questions</li>
                <li>• Record audio dictation for each question</li>
                <li>• Upload images and answer choices</li>
              </ul>
            </div>

            <div className="border-t pt-4 sm:pt-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
                For Students
              </h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Access tests with audio support</li>
                <li>• Listen to teacher-recorded audio</li>
                <li>• Take tests at your own pace</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-4 sm:pt-6">
            <SignIn />
          </div>
        </div>
      </div>
    );
  }

  const primaryRole = await getPrimaryUserRole(session.user.id);
  if (!primaryRole) {
    redirect("/setup");
  }

  if (primaryRole === "test_maker") {
    redirect("/maker");
  } else {
    redirect("/taker");
  }
}
