import { db } from "@/lib/db/drizzle";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPrimaryUserRole, setUserRole } from "../user";

vi.mock("@/lib/db/drizzle", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock("nanoid", () => ({
  nanoid: () => "test-id-123",
}));

describe("user-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPrimaryUserRole", () => {
    it("should return null when user has no roles", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      (db.select as unknown) = mockSelect;
      mockSelect.mockReturnValue({
        from: mockFrom,
      });
      mockFrom.mockReturnValue({
        where: mockWhere,
      });
      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });
      mockOrderBy.mockReturnValue({
        limit: mockLimit,
      });

      const role = await getPrimaryUserRole("user-123");

      expect(role).toBeNull();
    });

    it("should return the first role (by creation date)", async () => {
      const mockRoles = [
        {
          id: "role-1",
          userId: "user-123",
          role: "test_maker",
          createdAt: new Date("2025-01-01"),
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockRoles);

      (db.select as unknown) = mockSelect;
      mockSelect.mockReturnValue({
        from: mockFrom,
      });
      mockFrom.mockReturnValue({
        where: mockWhere,
      });
      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });
      mockOrderBy.mockReturnValue({
        limit: mockLimit,
      });

      const role = await getPrimaryUserRole("user-123");

      expect(role).toBe("test_maker");
    });
  });

  describe("setUserRole", () => {
    it("should remove all roles and set new one", async () => {
      const newRole = {
        id: "test-id-123",
        userId: "user-123",
        role: "test_taker",
        createdAt: new Date(),
      };

      const mockDelete = vi.fn().mockReturnThis();
      const mockDeleteWhere = vi.fn().mockResolvedValue(undefined);
      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([newRole]);

      const mockTx = {
        delete: mockDelete,
        insert: mockInsert,
      };

      mockDelete.mockReturnValue({
        where: mockDeleteWhere,
      });
      mockInsert.mockReturnValue({
        values: mockValues,
      });
      mockValues.mockReturnValue({
        returning: mockReturning,
      });

      (db.transaction as unknown) = vi.fn((callback) => callback(mockTx));

      const result = await setUserRole("user-123", "test_taker");

      expect(mockDelete).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
      expect(result.role).toBe("test_taker");
    });
  });
});
