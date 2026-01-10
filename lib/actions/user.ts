"use server";

import { ROLES, UpdateProfileSchema, type User } from "@/lib/models/user";
import {
  getCurrentUser,
  setUserRole,
  updateUserProfile,
} from "@/lib/services/user";
import { revalidatePath } from "next/cache";
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

export interface UpdateProfileResult {
  data?: User;
  error?: string;
}

export async function updateUserProfileAction(
  input: unknown,
): Promise<UpdateProfileResult> {
  try {
    const validated = UpdateProfileSchema.parse(input);
    const user = await getCurrentUser();

    const updated = await updateUserProfile(user.id, {
      name: validated.name,
      image: validated.image,
    });

    revalidatePath("/", "layout");
    return { data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid profile data" };
    }

    return {
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
