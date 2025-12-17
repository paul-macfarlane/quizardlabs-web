import { vi } from "vitest";

export const createDbMock = () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
    transaction: vi.fn((callback) =>
      callback({
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn(),
          })),
        })),
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(),
            })),
          })),
        })),
        delete: vi.fn(() => ({
          where: vi.fn(),
        })),
      }),
    ),
    query: {
      question: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      test: {
        findFirst: vi.fn(),
      },
      choice: {
        findFirst: vi.fn(),
      },
    },
  },
});
