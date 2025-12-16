import {
  addQuestion,
  deleteQuestion,
  getQuestionWithChoices,
  getQuestionsForTest,
  updateQuestion,
} from "@/lib/services/question";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/drizzle", async () => {
  const { createDbMock } = await import("@/lib/test-utils/db-mocks");
  return createDbMock();
});

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "test-id"),
}));

const { db } = await import("@/lib/db/drizzle");

describe("getQuestionsForTest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get all questions for a test", async () => {
    const mockQuestions = [
      {
        id: "q1",
        testId: "test-1",
        orderIndex: "0",
        text: "Question 1",
        type: "multi_choice" as const,
        imageUrl: null,
        audioUrl: null,
        createdAt: new Date(),
      },
    ];

    const mockOrderBy = vi.fn().mockResolvedValue(mockQuestions);
    const mockWhere = vi.fn(() => ({ orderBy: mockOrderBy }));
    const mockFrom = vi.fn(() => ({ where: mockWhere }));
    vi.mocked(db.select).mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof db.select>);

    const result = await getQuestionsForTest("test-1");

    expect(result).toEqual(mockQuestions);
    expect(db.select).toHaveBeenCalled();
  });
});

describe("addQuestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add a new question", async () => {
    const newQuestion = {
      testId: "test-1",
      orderIndex: "0",
      text: "New Question",
      type: "multi_choice" as const,
    };

    const mockQuestion = {
      id: "test-id",
      ...newQuestion,
      imagePath: null,
      audioPath: null,
      createdAt: new Date(),
    };

    const mockReturning = vi.fn().mockResolvedValue([mockQuestion]);
    const mockValues = vi.fn(() => ({ returning: mockReturning }));
    vi.mocked(db.insert).mockReturnValue({
      values: mockValues,
    } as unknown as ReturnType<typeof db.insert>);

    const result = await addQuestion(newQuestion);

    expect(result).toEqual(mockQuestion);
    expect(db.insert).toHaveBeenCalled();
  });
});

describe("updateQuestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a question", async () => {
    const updatedData = { text: "Updated Question" };
    const mockQuestion = {
      id: "q1",
      testId: "test-1",
      orderIndex: "0",
      text: "Updated Question",
      type: "multi_choice" as const,
      imageUrl: null,
      audioUrl: null,
      createdAt: new Date(),
    };

    const mockReturning = vi.fn().mockResolvedValue([mockQuestion]);
    const mockWhere = vi.fn(() => ({ returning: mockReturning }));
    const mockSet = vi.fn(() => ({ where: mockWhere }));
    vi.mocked(db.update).mockReturnValue({
      set: mockSet,
    } as unknown as ReturnType<typeof db.update>);

    const result = await updateQuestion("q1", updatedData);

    expect(result).toEqual(mockQuestion);
    expect(db.update).toHaveBeenCalled();
  });

  it("should return null if question not found", async () => {
    const mockReturning = vi.fn().mockResolvedValue([]);
    const mockWhere = vi.fn(() => ({ returning: mockReturning }));
    const mockSet = vi.fn(() => ({ where: mockWhere }));
    vi.mocked(db.update).mockReturnValue({
      set: mockSet,
    } as unknown as ReturnType<typeof db.update>);

    const result = await updateQuestion("q1", { text: "Updated" });

    expect(result).toBeNull();
  });
});

describe("deleteQuestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a question", async () => {
    const mockWhere = vi.fn().mockResolvedValue({ rowCount: 1 });
    vi.mocked(db.delete).mockReturnValue({
      where: mockWhere,
    } as unknown as ReturnType<typeof db.delete>);

    const result = await deleteQuestion("q1");

    expect(result).toBe(true);
    expect(db.delete).toHaveBeenCalled();
  });

  it("should return false if question not found", async () => {
    const mockWhere = vi.fn().mockResolvedValue({ rowCount: 0 });
    vi.mocked(db.delete).mockReturnValue({
      where: mockWhere,
    } as unknown as ReturnType<typeof db.delete>);

    const result = await deleteQuestion("q1");

    expect(result).toBe(false);
  });
});

describe("getQuestionWithChoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get a question with its choices", async () => {
    const mockQuestionWithChoices = {
      id: "q1",
      testId: "test-1",
      orderIndex: "0",
      text: "Question 1",
      type: "multi_choice" as const,
      imageUrl: null,
      audioUrl: null,
      createdAt: new Date(),
      choices: [
        {
          id: "c1",
          questionId: "q1",
          orderIndex: "0",
          text: "Choice 1",
          audioUrl: null,
          isCorrect: true,
        },
      ],
    };

    vi.mocked(db.query.question.findFirst).mockResolvedValue(
      mockQuestionWithChoices,
    );

    const result = await getQuestionWithChoices("q1");

    expect(result).toEqual(mockQuestionWithChoices);
    expect(db.query.question.findFirst).toHaveBeenCalledWith({
      where: expect.any(Object),
      with: {
        choices: {
          orderBy: expect.any(Function),
        },
      },
    });
  });

  it("should return null if question not found", async () => {
    vi.mocked(db.query.question.findFirst).mockResolvedValue(undefined);

    const result = await getQuestionWithChoices("q1");

    expect(result).toBeNull();
  });
});
