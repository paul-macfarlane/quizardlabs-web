import {
  addChoiceAction,
  addQuestionAction,
  deleteChoiceAction,
  deleteQuestionAction,
  reorderChoicesAction,
  updateChoiceAction,
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
  getChoiceWithQuestion: vi.fn(),
  getChoiceWithQuestionAndChoices: vi.fn(),
  addChoice: vi.fn(),
  updateChoice: vi.fn(),
  deleteChoice: vi.fn(),
  reorderChoices: vi.fn(),
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
  freeTextMode: null,
  expectedAnswer: null,
  imageSignedUrl: null,
  audioSignedUrl: null,
  createdAt: new Date(),
};

const mockChoice = {
  id: "c1",
  questionId: "q1",
  orderIndex: "0",
  text: "Choice 1",
  audioUrl: null,
  audioSignedUrl: null,
  isCorrect: true,
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

describe("addChoiceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue({
      ...mockQuestion,
      choices: [],
    });
  });

  it("should successfully add a choice", async () => {
    vi.mocked(questionService.addChoice).mockResolvedValue(mockChoice);

    const result = await addChoiceAction({
      questionId: "q1",
      text: "Choice 1",
      orderIndex: "0",
      isCorrect: false,
    });

    expect(result).toEqual({ data: mockChoice });
    expect(questionService.addChoice).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/maker/test/test-1");
  });

  it("should prevent adding a second correct choice to multi-choice question", async () => {
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue({
      ...mockQuestion,
      type: "multi_choice" as const,
      choices: [{ ...mockChoice, isCorrect: true }],
    });

    const result = await addChoiceAction({
      questionId: "q1",
      text: "Choice 2",
      orderIndex: "1",
      isCorrect: true,
    });

    expect(result).toEqual({
      error:
        "Multi-choice questions can only have one correct answer. Please unmark the existing correct choice first.",
    });
    expect(questionService.addChoice).not.toHaveBeenCalled();
  });

  it("should allow adding correct choice to multi-answer question", async () => {
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue({
      ...mockQuestion,
      type: "multi_answer" as const,
      choices: [{ ...mockChoice, isCorrect: true }],
    });
    vi.mocked(questionService.addChoice).mockResolvedValue({
      ...mockChoice,
      isCorrect: true,
    });

    const result = await addChoiceAction({
      questionId: "q1",
      text: "Choice 2",
      orderIndex: "1",
      isCorrect: true,
    });

    expect(result.data).toBeDefined();
    expect(questionService.addChoice).toHaveBeenCalled();
  });

  it("should return error for invalid input", async () => {
    const result = await addChoiceAction({
      questionId: "q1",
      text: "",
      orderIndex: "0",
    });

    expect(result).toEqual({ error: "Invalid choice data" });
    expect(questionService.addChoice).not.toHaveBeenCalled();
  });

  it("should return error when question not found", async () => {
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue(null);

    const result = await addChoiceAction({
      questionId: "q1",
      text: "Choice 1",
      orderIndex: "0",
      isCorrect: true,
    });

    expect(result).toEqual({ error: "Question not found" });
    expect(questionService.addChoice).not.toHaveBeenCalled();
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await addChoiceAction({
      questionId: "q1",
      text: "Choice 1",
      orderIndex: "0",
      isCorrect: true,
    });

    expect(result).toEqual({ error: "Access denied" });
    expect(questionService.addChoice).not.toHaveBeenCalled();
  });
});

describe("updateChoiceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
    vi.mocked(
      questionService.getChoiceWithQuestionAndChoices,
    ).mockResolvedValue({
      ...mockChoice,
      question: {
        ...mockQuestion,
        choices: [mockChoice],
      },
    });
  });

  it("should successfully update a choice", async () => {
    vi.mocked(questionService.updateChoice).mockResolvedValue(mockChoice);

    const result = await updateChoiceAction({
      id: "c1",
      text: "Updated Choice",
    });

    expect(result).toEqual({ data: mockChoice });
    expect(questionService.updateChoice).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/maker/test/test-1");
  });

  it("should prevent marking second choice as correct in multi-choice question", async () => {
    vi.mocked(
      questionService.getChoiceWithQuestionAndChoices,
    ).mockResolvedValue({
      ...mockChoice,
      id: "c1",
      isCorrect: false,
      question: {
        ...mockQuestion,
        type: "multi_choice" as const,
        choices: [
          { ...mockChoice, id: "c1", isCorrect: false },
          { ...mockChoice, id: "c2", isCorrect: true },
        ],
      },
    });

    const result = await updateChoiceAction({
      id: "c1",
      isCorrect: true,
    });

    expect(result).toEqual({
      error:
        "Multi-choice questions can only have one correct answer. Please unmark other choices first.",
    });
    expect(questionService.updateChoice).not.toHaveBeenCalled();
  });

  it("should allow marking choice as correct in multi-choice when no others are correct", async () => {
    vi.mocked(
      questionService.getChoiceWithQuestionAndChoices,
    ).mockResolvedValue({
      ...mockChoice,
      id: "c1",
      isCorrect: false,
      question: {
        ...mockQuestion,
        type: "multi_choice" as const,
        choices: [
          { ...mockChoice, id: "c1", isCorrect: false },
          { ...mockChoice, id: "c2", isCorrect: false },
        ],
      },
    });
    vi.mocked(questionService.updateChoice).mockResolvedValue({
      ...mockChoice,
      isCorrect: true,
    });

    const result = await updateChoiceAction({
      id: "c1",
      isCorrect: true,
    });

    expect(result.data).toBeDefined();
    expect(questionService.updateChoice).toHaveBeenCalled();
  });

  it("should allow multiple correct choices in multi-answer question", async () => {
    vi.mocked(
      questionService.getChoiceWithQuestionAndChoices,
    ).mockResolvedValue({
      ...mockChoice,
      id: "c1",
      isCorrect: false,
      question: {
        ...mockQuestion,
        type: "multi_answer" as const,
        choices: [
          { ...mockChoice, id: "c1", isCorrect: false },
          { ...mockChoice, id: "c2", isCorrect: true },
        ],
      },
    });
    vi.mocked(questionService.updateChoice).mockResolvedValue({
      ...mockChoice,
      isCorrect: true,
    });

    const result = await updateChoiceAction({
      id: "c1",
      isCorrect: true,
    });

    expect(result.data).toBeDefined();
    expect(questionService.updateChoice).toHaveBeenCalled();
  });

  it("should return error when choice not found", async () => {
    vi.mocked(
      questionService.getChoiceWithQuestionAndChoices,
    ).mockResolvedValue(null);

    const result = await updateChoiceAction({
      id: "c1",
      text: "Updated Choice",
    });

    expect(result).toEqual({ error: "Choice not found" });
    expect(questionService.updateChoice).not.toHaveBeenCalled();
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await updateChoiceAction({
      id: "c1",
      text: "Updated Choice",
    });

    expect(result).toEqual({ error: "Access denied" });
    expect(questionService.updateChoice).not.toHaveBeenCalled();
  });
});

describe("deleteChoiceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
    vi.mocked(questionService.getChoiceWithQuestion).mockResolvedValue({
      ...mockChoice,
      question: mockQuestion,
    });
  });

  it("should successfully delete a choice", async () => {
    vi.mocked(questionService.deleteChoice).mockResolvedValue(true);

    const result = await deleteChoiceAction("c1");

    expect(result).toEqual({ error: undefined });
    expect(questionService.deleteChoice).toHaveBeenCalledWith("c1");
    expect(revalidatePath).toHaveBeenCalledWith("/maker/test/test-1");
  });

  it("should return error when choice not found", async () => {
    vi.mocked(questionService.getChoiceWithQuestion).mockResolvedValue(null);

    const result = await deleteChoiceAction("c1");

    expect(result).toEqual({ error: "Choice not found" });
    expect(questionService.deleteChoice).not.toHaveBeenCalled();
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await deleteChoiceAction("c1");

    expect(result).toEqual({ error: "Access denied" });
    expect(questionService.deleteChoice).not.toHaveBeenCalled();
  });
});

describe("reorderChoicesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(true);
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue({
      ...mockQuestion,
      choices: [
        { ...mockChoice, id: "c1", orderIndex: "0" },
        { ...mockChoice, id: "c2", orderIndex: "1" },
      ],
    });
  });

  it("should successfully reorder choices", async () => {
    vi.mocked(questionService.reorderChoices).mockResolvedValue(true);

    const result = await reorderChoicesAction({
      questionId: "q1",
      updates: [
        { id: "c2", orderIndex: "0" },
        { id: "c1", orderIndex: "1" },
      ],
    });

    expect(result).toEqual({ error: undefined });
    expect(questionService.reorderChoices).toHaveBeenCalledWith([
      { id: "c2", orderIndex: "0" },
      { id: "c1", orderIndex: "1" },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/maker/test/test-1");
  });

  it("should return error when question not found", async () => {
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue(null);

    const result = await reorderChoicesAction({
      questionId: "q1",
      updates: [
        { id: "c1", orderIndex: "0" },
        { id: "c2", orderIndex: "1" },
      ],
    });

    expect(result).toEqual({ error: "Question not found" });
    expect(questionService.reorderChoices).not.toHaveBeenCalled();
  });

  it("should return error when user cannot access test", async () => {
    vi.mocked(testService.canUserAccessTest).mockResolvedValue(false);

    const result = await reorderChoicesAction({
      questionId: "q1",
      updates: [
        { id: "c1", orderIndex: "0" },
        { id: "c2", orderIndex: "1" },
      ],
    });

    expect(result).toEqual({ error: "Access denied" });
    expect(questionService.reorderChoices).not.toHaveBeenCalled();
  });

  it("should return error for invalid input", async () => {
    const result = await reorderChoicesAction({
      questionId: "",
      updates: [],
    });

    expect(result).toEqual({ error: "Invalid reorder data" });
    expect(questionService.reorderChoices).not.toHaveBeenCalled();
  });

  it("should return error when choice IDs do not belong to the question", async () => {
    vi.mocked(questionService.getQuestionWithChoices).mockResolvedValue({
      ...mockQuestion,
      choices: [
        { ...mockChoice, id: "c1", orderIndex: "0" },
        { ...mockChoice, id: "c2", orderIndex: "1" },
      ],
    });

    const result = await reorderChoicesAction({
      questionId: "q1",
      updates: [
        { id: "c1", orderIndex: "0" },
        { id: "c3", orderIndex: "1" }, // c3 doesn't belong to this question
      ],
    });

    expect(result).toEqual({
      error: "Invalid choice IDs: all choices must belong to this question",
    });
    expect(questionService.reorderChoices).not.toHaveBeenCalled();
  });
});
