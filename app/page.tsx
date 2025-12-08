import { auth } from "@/lib/auth";
import { R2ImageUpload } from "@/lib/components/r2-image-upload";
import { SignIn } from "@/lib/components/sign-in";
import { SignOut } from "@/lib/components/sign-out";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Authentication Required
            </h1>
            <p className="text-gray-600">
              Please sign in to access the R2 image upload demo.
            </p>
            <SignIn />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Cloudflare R2 Image Upload Demo
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Logged in as {session.user.email}
            </span>
            <SignOut />
          </div>
        </div>
        <R2ImageUpload />
      </div>
    </div>
  );
}
