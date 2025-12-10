"use server";

import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/models/user";
import { setUserRole } from "@/lib/services/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Not authenticated");
  }

  return session.user;
}

const SetUserRoleSchema = z.object({
  role: z.enum(ROLES),
});

export async function setUserRoleAction(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  let validatedRole: "test_maker" | "test_taker";

  try {
    const role = formData.get("role");
    const parsed = SetUserRoleSchema.parse({ role });
    validatedRole = parsed.role;

    const user = await getCurrentUser();
    await setUserRole(user.id, validatedRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Please select a role" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set role",
    };
  }

  if (validatedRole === "test_maker") {
    redirect("/maker");
  } else {
    redirect("/taker");
  }
}
