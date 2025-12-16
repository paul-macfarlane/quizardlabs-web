import {
  addQuestionAction,
  deleteQuestionAction,
  updateQuestionAction,
} from "@/lib/actions/question";
import * as questionService from "@/lib/services/question";
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
  canUserAccessTest: vi.fn(),
}));

vi.mock("@/lib/services/question", () => ({
  addQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
  getQuestionWithChoices: vi.fn(),
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

const mockQuestion = {
  id: "q1",
  testId: "test-1",
  orderIndex: "0",
  text: "Question 1",
  type: "multi_choice" as const,
  imageUrl: null,
  audioUrl: null,
  createdAt: new Date(),
};

describe("addQuestionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
  });

  it("should successfully add a question", async () => {
    vi.mocked(questionService.addQuestion).mockResolvedValue(mockQuestion);

    const result = await addQuestionAction({
      testId: "test-1",
      text: "Question 1",
      type: "multi_choice" as const,
      orderIndex: "0",
    });

    expect(result).toEqual({ data: mockQuestion });
    expect(questionService.addQuestion).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/maker/test/test-1");
  });

  it("should return error for invalid input", async () => {
    const result = await addQuestionAction({
      testId: "test-1",
      text: "",
      type: "multi_choice",
      orderIndex: "0",
    });

    expect(result).toEqual({ error: "Invalid question data" });
    expect(questionService.addQuestion).not.toHaveBeenCalled();
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await addQuestionAction({
      testId: "test-1",
      text: "Question 1",
      type: "multi_choice" as const,
      orderIndex: "0",
    });

    expect(result).toEqual({ error: "Access denied" });
    expect(questionService.addQuestion).not.toHaveBeenCalled();
  });
});

describe("updateQuestionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue({
      ...mockQuestion,
      choices: [],
    });
  });

  it("should successfully update a question", async () => {
    vi.mocked(questionService.updateQuestion).mockResolvedValue(mockQuestion);

    const result = await updateQuestionAction({
      id: "q1",
      text: "Updated Question",
    });

    expect(result).toEqual({ data: mockQuestion });
    expect(questionService.updateQuestion).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/maker/test/test-1");
  });

  it("should return error when question not found", async () => {
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue(null);

    const result = await updateQuestionAction({
      id: "q1",
      text: "Updated Question",
    });

    expect(result).toEqual({ error: "Question not found" });
    expect(questionService.updateQuestion).not.toHaveBeenCalled();
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await updateQuestionAction({
      id: "q1",
      text: "Updated Question",
    });

    expect(result).toEqual({ error: "Access denied" });
    expect(questionService.updateQuestion).not.toHaveBeenCalled();
  });
});

describe("deleteQuestionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue({
      ...mockQuestion,
      choices: [],
    });
  });

  it("should successfully delete a question", async () => {
    vi.mocked(questionService.deleteQuestion).mockResolvedValue(true);

    const result = await deleteQuestionAction("q1");

    expect(result).toEqual({ error: undefined });
    expect(questionService.deleteQuestion).toHaveBeenCalledWith("q1");
    expect(revalidatePath).toHaveBeenCalledWith("/maker/test/test-1");
  });

  it("should return error when question not found", async () => {
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue(null);

    const result = await deleteQuestionAction("q1");

    expect(result).toEqual({ error: "Question not found" });
    expect(questionService.deleteQuestion).not.toHaveBeenCalled();
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await deleteQuestionAction("q1");

    expect(result).toEqual({ error: "Access denied" });
    expect(questionService.deleteQuestion).not.toHaveBeenCalled();
  });
});
