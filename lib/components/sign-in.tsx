"use client";

import { authClient } from "@/lib/auth-client";

export function SignIn() {
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
          })
        }
        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        Login with Google
      </button>
      <button
        onClick={() =>
          authClient.signIn.social({
            provider: "discord",
          })
        }
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        Login with Discord
      </button>
    </div>
  );
}
