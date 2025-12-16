import { db } from "@/lib/db/drizzle";
import { type Test } from "@/lib/models/test";
import {
  canUserAccessTest,
  createTest,
  deleteTest,
  getTest,
  getTestsByCreator,
  updateTest,
} from "@/lib/services/test";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/drizzle", async () => {
  const { createDbMock } = await import("@/lib/test-utils/db-mocks");
  return createDbMock();
});

describe("Test Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTest", () => {
    it("should create a new test", async () => {
      const mockTest: Test = {
        id: "test-123",
        name: "Math Quiz",
        description: "A math test",
        createdBy: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockReturning = vi.fn().mockResolvedValue([mockTest]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      (db.insert as unknown) = vi.fn().mockReturnValue({ values: mockValues });

      const result = await createTest({
        name: "Math Quiz",
        description: "A math test",
        createdBy: "user-123",
      });

      expect(result).toEqual(mockTest);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("getTestsByCreator", () => {
    it("should return tests for a creator", async () => {
      const mockTests: Test[] = [
        {
          id: "test-1",
          name: "Test 1",
          description: null,
          createdBy: "user-123",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "test-2",
          name: "Test 2",
          description: null,
          createdBy: "user-123",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockOrderBy = vi.fn().mockResolvedValue(mockTests);
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as unknown) = mockSelect;

      const result = await getTestsByCreator("user-123");

      expect(result).toEqual(mockTests);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("getTest", () => {
    it("should return a test by id", async () => {
      const mockTest: Test = {
        id: "test-123",
        name: "Math Quiz",
        description: "A math test",
        createdBy: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLimit = vi.fn().mockResolvedValue([mockTest]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as unknown) = mockSelect;

      const result = await getTest("test-123");

      expect(result).toEqual(mockTest);
    });

    it("should return null if test not found", async () => {
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as unknown) = mockSelect;

      const result = await getTest("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("updateTest", () => {
    it("should update a test", async () => {
      const mockTest: Test = {
        id: "test-123",
        name: "Updated Quiz",
        description: "Updated description",
        createdBy: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockReturning = vi.fn().mockResolvedValue([mockTest]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as unknown) = vi.fn().mockReturnValue({ set: mockSet });

      const result = await updateTest("test-123", {
        name: "Updated Quiz",
        description: "Updated description",
      });

      expect(result).toEqual(mockTest);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("deleteTest", () => {
    it("should delete a test", async () => {
      const mockWhere = vi.fn().mockResolvedValue({ rowCount: 1 });
      (db.delete as unknown) = vi.fn().mockReturnValue({ where: mockWhere });

      const result = await deleteTest("test-123");

      expect(result).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("canUserAccessTest", () => {
    it("should return true if user owns the test", async () => {
      const mockTest: Test = {
        id: "test-123",
        name: "Math Quiz",
        description: null,
        createdBy: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLimit = vi.fn().mockResolvedValue([mockTest]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as unknown) = mockSelect;

      const result = await canUserAccessTest("test-123", "user-123");

      expect(result).toBe(true);
    });

    it("should return false if user does not own the test", async () => {
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as unknown) = mockSelect;

      const result = await canUserAccessTest("test-123", "other-user");

      expect(result).toBe(false);
    });
  });
});
