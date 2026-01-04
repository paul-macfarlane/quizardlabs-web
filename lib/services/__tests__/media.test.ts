import { deleteObject, generateUploadUrl } from "@/lib/r2-client";
import { deleteMedia, generateMediaUploadUrl } from "@/lib/services/media";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/r2-client", () => ({
  generateUploadUrl: vi.fn(),
  generateDownloadUrl: vi.fn(),
  deleteObject: vi.fn(),
  EXPIRES_IN: 3600,
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "mock-uuid-123"),
}));

describe("Media Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateMediaUploadUrl", () => {
    it("should generate upload URL for question image", async () => {
      const mockUploadUrl = "https://r2.example.com/upload?signed=true";
      (generateUploadUrl as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUploadUrl,
      );

      const result = await generateMediaUploadUrl({
        type: "question_image",
        testId: "test-123",
        questionId: "question-456",
        contentType: "image/png",
      });

      expect(result.uploadUrl).toBe(mockUploadUrl);
      expect(result.key).toBe(
        "tests/test-123/questions/question-456/images/mock-uuid-123",
      );
      expect(generateUploadUrl).toHaveBeenCalledWith(
        "tests/test-123/questions/question-456/images/mock-uuid-123",
        "image/png",
        3600,
      );
    });

    it("should generate upload URL for question audio", async () => {
      const mockUploadUrl = "https://r2.example.com/upload?signed=true";
      (generateUploadUrl as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUploadUrl,
      );

      const result = await generateMediaUploadUrl({
        type: "question_audio",
        testId: "test-123",
        questionId: "question-456",
        contentType: "audio/webm",
      });

      expect(result.uploadUrl).toBe(mockUploadUrl);
      expect(result.key).toBe(
        "tests/test-123/questions/question-456/audio/mock-uuid-123",
      );
      expect(generateUploadUrl).toHaveBeenCalledWith(
        "tests/test-123/questions/question-456/audio/mock-uuid-123",
        "audio/webm",
        3600,
      );
    });

    it("should generate upload URL for choice audio", async () => {
      const mockUploadUrl = "https://r2.example.com/upload?signed=true";
      (generateUploadUrl as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUploadUrl,
      );

      const result = await generateMediaUploadUrl({
        type: "choice_audio",
        testId: "test-123",
        questionId: "question-456",
        choiceId: "choice-789",
        contentType: "audio/webm",
      });

      expect(result.uploadUrl).toBe(mockUploadUrl);
      expect(result.key).toBe(
        "tests/test-123/questions/question-456/choices/choice-789/audio/mock-uuid-123",
      );
      expect(generateUploadUrl).toHaveBeenCalledWith(
        "tests/test-123/questions/question-456/choices/choice-789/audio/mock-uuid-123",
        "audio/webm",
        3600,
      );
    });

    it("should throw error for choice_audio without choiceId", async () => {
      await expect(
        generateMediaUploadUrl({
          type: "choice_audio",
          testId: "test-123",
          questionId: "question-456",
          contentType: "audio/webm",
        }),
      ).rejects.toThrow("choiceId is required for choice_audio type");
    });
  });

  describe("deleteMedia", () => {
    it("should delete media from R2", async () => {
      (deleteObject as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const key = "tests/test-123/questions/question-456/images/uuid-123";
      await deleteMedia(key);

      expect(deleteObject).toHaveBeenCalledWith(key);
    });
  });
});
