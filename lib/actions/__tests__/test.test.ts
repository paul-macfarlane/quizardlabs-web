import {
  createTestAction,
  deleteTestAction,
  getMyTestsAction,
  getTestAction,
  updateTestAction,
} from "@/lib/actions/test";
import * as testService from "@/lib/services/test";
import * as userService from "@/lib/services/user";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/services/user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/services/test", () => ({
  createTest: vi.fn(),
  getTestsByCreator: vi.fn(),
  getTest: vi.fn(),
  updateTest: vi.fn(),
  deleteTest: vi.fn(),
  canUserAccessTest: vi.fn(),
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

const mockTest = {
  id: "test-1",
  name: "Math Quiz",
  description: "A math quiz",
  createdBy: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("createTestAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
  });

  it("should successfully create a test", async () => {
    vi.mocked(testService.createTest).mockResolvedValue(mockTest);

    const result = await createTestAction({
      name: "Math Quiz",
      description: "A math quiz",
    });

    expect(result).toEqual({ data: mockTest });
    expect(testService.createTest).toHaveBeenCalledWith({
      createdBy: "user-1",
      name: "Math Quiz",
      description: "A math quiz",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/maker");
  });

  it("should create test without description", async () => {
    const testWithoutDesc = { ...mockTest, description: null };
    vi.mocked(testService.createTest).mockResolvedValue(testWithoutDesc);

    const result = await createTestAction({
      name: "Math Quiz",
    });

    expect(result).toEqual({ data: testWithoutDesc });
    expect(testService.createTest).toHaveBeenCalledWith({
      createdBy: "user-1",
      name: "Math Quiz",
    });
  });

  it("should return error for invalid input", async () => {
    const result = await createTestAction({
      name: "",
      description: "A math quiz",
    });

    expect(result).toEqual({ error: "Invalid test data" });
    expect(testService.createTest).not.toHaveBeenCalled();
  });

  it("should return error when name is too long", async () => {
    const result = await createTestAction({
      name: "a".repeat(256),
      description: "A math quiz",
    });

    expect(result).toEqual({ error: "Invalid test data" });
    expect(testService.createTest).not.toHaveBeenCalled();
  });

  it("should handle service errors", async () => {
    vi.mocked(testService.createTest).mockRejectedValue(
      new Error("Database error"),
    );

    const result = await createTestAction({
      name: "Math Quiz",
      description: "A math quiz",
    });

    expect(result).toEqual({ error: "Database error" });
  });

  it("should handle authentication errors", async () => {
    vi.mocked(userService.getCurrentUser).mockRejectedValue(
      new Error("Not authenticated"),
    );

    const result = await createTestAction({
      name: "Math Quiz",
      description: "A math quiz",
    });

    expect(result).toEqual({ error: "Not authenticated" });
    expect(testService.createTest).not.toHaveBeenCalled();
  });
});

describe("getMyTestsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
  });

  it("should successfully get user tests", async () => {
    const tests = [mockTest];
    vi.mocked(testService.getTestsByCreator).mockResolvedValue(tests);

    const result = await getMyTestsAction();

    expect(result).toEqual({ data: tests });
    expect(testService.getTestsByCreator).toHaveBeenCalledWith("user-1");
  });

  it("should return empty array when user has no tests", async () => {
    vi.mocked(testService.getTestsByCreator).mockResolvedValue([]);

    const result = await getMyTestsAction();

    expect(result).toEqual({ data: [] });
  });

  it("should handle service errors", async () => {
    vi.mocked(testService.getTestsByCreator).mockRejectedValue(
      new Error("Database error"),
    );

    const result = await getMyTestsAction();

    expect(result).toEqual({ error: "Database error" });
  });

  it("should handle authentication errors", async () => {
    vi.mocked(userService.getCurrentUser).mockRejectedValue(
      new Error("Not authenticated"),
    );

    const result = await getMyTestsAction();

    expect(result).toEqual({ error: "Not authenticated" });
  });
});

describe("getTestAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
  });

  it("should successfully get a test", async () => {
    vi.mocked(testService.getTest).mockResolvedValue(mockTest);

    const result = await getTestAction("test-1");

    expect(result).toEqual({ data: mockTest });
    expect(testService.getTest).toHaveBeenCalledWith("test-1");
    expect(testService.canUserAccessTest).toHaveBeenCalledWith(
      "test-1",
      "user-1",
    );
  });

  it("should return error for invalid test ID", async () => {
    const result = await getTestAction("");

    expect(result).toEqual({ error: "Invalid test ID" });
    expect(testService.getTest).not.toHaveBeenCalled();
  });

  it("should return error when test not found", async () => {
    vi.mocked(testService.getTest).mockResolvedValue(null);

    const result = await getTestAction("test-1");

    expect(result).toEqual({ error: "Test not found" });
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.getTest).mockResolvedValue(mockTest);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await getTestAction("test-1");

    expect(result).toEqual({ error: "Access denied" });
  });

  it("should handle service errors", async () => {
    vi.mocked(testService.getTest).mockRejectedValue(
      new Error("Database error"),
    );

    const result = await getTestAction("test-1");

    expect(result).toEqual({ error: "Database error" });
  });
});

describe("updateTestAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
  });

  it("should successfully update a test", async () => {
    const updatedTest = { ...mockTest, name: "Updated Quiz" };
    vi.mocked(testService.updateTest).mockResolvedValue(updatedTest);

    const result = await updateTestAction({
      id: "test-1",
      name: "Updated Quiz",
    });

    expect(result).toEqual({ data: updatedTest });
    expect(testService.updateTest).toHaveBeenCalledWith("test-1", {
      name: "Updated Quiz",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/maker");
    expect(revalidatePath).toHaveBeenCalledWith("/maker/test/test-1");
  });

  it("should update only description", async () => {
    const updatedTest = { ...mockTest, description: "New description" };
    vi.mocked(testService.updateTest).mockResolvedValue(updatedTest);

    const result = await updateTestAction({
      id: "test-1",
      description: "New description",
    });

    expect(result).toEqual({ data: updatedTest });
    expect(testService.updateTest).toHaveBeenCalledWith("test-1", {
      description: "New description",
    });
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await updateTestAction({
      id: "test-1",
      name: "Updated Quiz",
    });

    expect(result).toEqual({ error: "Access denied" });
    expect(testService.updateTest).not.toHaveBeenCalled();
  });

  it("should return error when test not found", async () => {
    vi.mocked(testService.updateTest).mockResolvedValue(null);

    const result = await updateTestAction({
      id: "test-1",
      name: "Updated Quiz",
    });

    expect(result).toEqual({ error: "Test not found" });
  });

  it("should return error for invalid input", async () => {
    const result = await updateTestAction({
      id: "test-1",
      name: "",
    });

    expect(result).toEqual({ error: "Invalid test data" });
    expect(testService.updateTest).not.toHaveBeenCalled();
  });

  it("should handle service errors", async () => {
    vi.mocked(testService.updateTest).mockRejectedValue(
      new Error("Database error"),
    );

    const result = await updateTestAction({
      id: "test-1",
      name: "Updated Quiz",
    });

    expect(result).toEqual({ error: "Database error" });
  });
});

describe("deleteTestAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
  });

  it("should successfully delete a test", async () => {
    vi.mocked(testService.deleteTest).mockResolvedValue(true);

    const result = await deleteTestAction("test-1");

    expect(result).toEqual({ error: undefined });
    expect(testService.deleteTest).toHaveBeenCalledWith("test-1");
    expect(revalidatePath).toHaveBeenCalledWith("/maker");
    expect(revalidatePath).toHaveBeenCalledWith("/maker/test/test-1");
  });

  it("should return error for invalid test ID", async () => {
    const result = await deleteTestAction("");

    expect(result).toEqual({ error: "Invalid test ID" });
    expect(testService.deleteTest).not.toHaveBeenCalled();
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await deleteTestAction("test-1");

    expect(result).toEqual({ error: "Access denied" });
    expect(testService.deleteTest).not.toHaveBeenCalled();
  });

  it("should return error when test not found", async () => {
    vi.mocked(testService.deleteTest).mockResolvedValue(false);

    const result = await deleteTestAction("test-1");

    expect(result).toEqual({ error: "Test not found" });
  });

  it("should handle service errors", async () => {
    vi.mocked(testService.deleteTest).mockRejectedValue(
      new Error("Database error"),
    );

    const result = await deleteTestAction("test-1");

    expect(result).toEqual({ error: "Database error" });
  });
});
