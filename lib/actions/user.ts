"use server";

import { ROLES } from "@/lib/models/user";
import { getCurrentUser, setUserRole } from "@/lib/services/user";
import { redirect } from "next/navigation";
import { z } from "zod";

const SetUserRoleSchema = z.object({
  role: z.enum(ROLES),
});

export interface SetUserRoleResult {
  error?: string;
}

export async function setUserRoleAction(
  _prevState: SetUserRoleResult,
  formData: FormData,
): Promise<SetUserRoleResult> {
  let validatedRole: "test_maker" | "test_taker";

  try {
    const role = formData.get("role");
    const parsed = SetUserRoleSchema.parse({ role });
    validatedRole = parsed.role;

    const user = await getCurrentUser();
    await setUserRole(user.id, validatedRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Please select a role" };
    }

    return {
      error: error instanceof Error ? error.message : "Failed to set role",
    };
  }

  if (validatedRole === "test_maker") {
    redirect("/maker");
  } else {
    redirect("/taker");
  }
}
