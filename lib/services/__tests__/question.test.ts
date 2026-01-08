import {
  addChoice,
  addQuestion,
  deleteChoice,
  deleteQuestion,
  getQuestionWithChoices,
  getQuestionsForTest,
  updateChoice,
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

vi.mock("@/lib/services/media", () => ({
  signMediaUrl: vi.fn().mockResolvedValue(null),
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
        freeTextMode: null,
        expectedAnswer: null,
        createdAt: new Date(),
        choices: [],
      },
    ];

    const expectedQuestions = [
      {
        ...mockQuestions[0],
        imageSignedUrl: null,
        audioSignedUrl: null,
      },
    ];

    vi.mocked(db.query.question.findMany).mockResolvedValue(mockQuestions);

    const result = await getQuestionsForTest("test-1");

    expect(result).toEqual(expectedQuestions);
    expect(db.query.question.findMany).toHaveBeenCalled();
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
      freeTextMode: null,
      expectedAnswer: null,
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

    const expectedQuestionWithChoices = {
      ...mockQuestionWithChoices,
      imageSignedUrl: null,
      audioSignedUrl: null,
      choices: [
        {
          ...mockQuestionWithChoices.choices[0],
          audioSignedUrl: null,
        },
      ],
    };

    vi.mocked(db.query.question.findFirst).mockResolvedValue(
      mockQuestionWithChoices,
    );

    const result = await getQuestionWithChoices("q1");

    expect(result).toEqual(expectedQuestionWithChoices);
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

describe("addChoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add a new choice", async () => {
    const newChoice = {
      questionId: "q1",
      orderIndex: "0",
      text: "Choice 1",
      isCorrect: true,
    };

    const mockChoice = {
      id: "test-id",
      ...newChoice,
      audioUrl: null,
    };

    const mockReturning = vi.fn().mockResolvedValue([mockChoice]);
    const mockValues = vi.fn(() => ({ returning: mockReturning }));
    vi.mocked(db.insert).mockReturnValue({
      values: mockValues,
    } as unknown as ReturnType<typeof db.insert>);

    const result = await addChoice(newChoice);

    expect(result).toEqual(mockChoice);
    expect(db.insert).toHaveBeenCalled();
  });
});

describe("updateChoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a choice", async () => {
    const updatedData = { text: "Updated Choice" };
    const mockChoice = {
      id: "c1",
      questionId: "q1",
      orderIndex: "0",
      text: "Updated Choice",
      audioUrl: null,
      isCorrect: false,
    };

    const mockReturning = vi.fn().mockResolvedValue([mockChoice]);
    const mockWhere = vi.fn(() => ({ returning: mockReturning }));
    const mockSet = vi.fn(() => ({ where: mockWhere }));
    vi.mocked(db.update).mockReturnValue({
      set: mockSet,
    } as unknown as ReturnType<typeof db.update>);

    const result = await updateChoice("c1", updatedData);

    expect(result).toEqual(mockChoice);
    expect(db.update).toHaveBeenCalled();
  });

  it("should return null if choice not found", async () => {
    const mockReturning = vi.fn().mockResolvedValue([]);
    const mockWhere = vi.fn(() => ({ returning: mockReturning }));
    const mockSet = vi.fn(() => ({ where: mockWhere }));
    vi.mocked(db.update).mockReturnValue({
      set: mockSet,
    } as unknown as ReturnType<typeof db.update>);

    const result = await updateChoice("c1", { text: "Updated" });

    expect(result).toBeNull();
  });
});

describe("deleteChoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a choice", async () => {
    const mockWhere = vi.fn().mockResolvedValue({ rowCount: 1 });
    vi.mocked(db.delete).mockReturnValue({
      where: mockWhere,
    } as unknown as ReturnType<typeof db.delete>);

    const result = await deleteChoice("c1");

    expect(result).toBe(true);
    expect(db.delete).toHaveBeenCalled();
  });

  it("should return false if choice not found", async () => {
    const mockWhere = vi.fn().mockResolvedValue({ rowCount: 0 });
    vi.mocked(db.delete).mockReturnValue({
      where: mockWhere,
    } as unknown as ReturnType<typeof db.delete>);

    const result = await deleteChoice("c1");

    expect(result).toBe(false);
  });
});
