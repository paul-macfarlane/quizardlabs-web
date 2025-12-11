import { setUserRoleAction } from "@/lib/actions/user";
import * as userService from "@/lib/services/user";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/services/user", () => ({
  setUserRole: vi.fn(),
  getCurrentUser: vi.fn(),
}));

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  image: null,
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("setUserRoleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(redirect).mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    });
  });

  it("should successfully set user role and redirect for test_maker", async () => {
    vi.mocked(userService.setUserRole).mockResolvedValue({
      id: "role-1",
      userId: "user-1",
      role: "test_maker",
      createdAt: new Date(),
    });

    const formData = new FormData();
    formData.append("role", "test_maker");

    await expect(setUserRoleAction({}, formData)).rejects.toThrow(
      "NEXT_REDIRECT: /maker",
    );

    expect(userService.setUserRole).toHaveBeenCalledWith(
      "user-1",
      "test_maker",
    );
    expect(redirect).toHaveBeenCalledWith("/maker");
  });

  it("should successfully set user role and redirect for test_taker", async () => {
    vi.mocked(userService.setUserRole).mockResolvedValue({
      id: "role-1",
      userId: "user-1",
      role: "test_taker",
      createdAt: new Date(),
    });

    const formData = new FormData();
    formData.append("role", "test_taker");

    await expect(setUserRoleAction({}, formData)).rejects.toThrow(
      "NEXT_REDIRECT: /taker",
    );

    expect(userService.setUserRole).toHaveBeenCalledWith(
      "user-1",
      "test_taker",
    );
    expect(redirect).toHaveBeenCalledWith("/taker");
  });

  it("should return error for invalid role", async () => {
    const formData = new FormData();
    formData.append("role", "invalid_role");

    const result = await setUserRoleAction({}, formData);

    expect(result).toEqual({ error: "Please select a role" });
    expect(userService.setUserRole).not.toHaveBeenCalled();
  });

  it("should return error for missing role", async () => {
    const formData = new FormData();

    const result = await setUserRoleAction({}, formData);

    expect(result).toEqual({ error: "Please select a role" });
    expect(userService.setUserRole).not.toHaveBeenCalled();
  });

  it("should handle service errors", async () => {
    vi.mocked(userService.setUserRole).mockRejectedValue(
      new Error("Database error"),
    );

    const formData = new FormData();
    formData.append("role", "test_maker");

    const result = await setUserRoleAction({}, formData);

    expect(result).toEqual({ error: "Database error" });
    expect(userService.setUserRole).toHaveBeenCalledWith(
      "user-1",
      "test_maker",
    );
  });

  it("should handle unknown errors", async () => {
    vi.mocked(userService.setUserRole).mockRejectedValue("Unknown error");

    const formData = new FormData();
    formData.append("role", "test_maker");

    const result = await setUserRoleAction({}, formData);

    expect(result).toEqual({ error: "Failed to set role" });
  });
});
