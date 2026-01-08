"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignIn() {
  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
          })
        }
      >
        Login with Google
      </Button>
      <Button
        onClick={() =>
          authClient.signIn.social({
            provider: "discord",
          })
        }
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
      >
        Login with Discord
      </Button>
    </div>
  );
}
