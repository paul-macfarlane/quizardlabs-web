import {
  gradeFreeTextExactMatch,
  gradeMultiAnswerQuestion,
  gradeMultiChoiceAnswer,
} from "@/lib/services/grading";
import { describe, expect, it } from "vitest";

describe("Grading Service", () => {
  describe("gradeMultiChoiceAnswer", () => {
    it("should return true when selected choice is correct", () => {
      const result = gradeMultiChoiceAnswer("choice-1", ["choice-1"]);
      expect(result).toBe(true);
    });

    it("should return false when selected choice is incorrect", () => {
      const result = gradeMultiChoiceAnswer("choice-2", ["choice-1"]);
      expect(result).toBe(false);
    });

    it("should return false when no choice is selected", () => {
      const result = gradeMultiChoiceAnswer(null, ["choice-1"]);
      expect(result).toBe(false);
    });

    it("should handle multiple correct choices", () => {
      const result = gradeMultiChoiceAnswer("choice-2", [
        "choice-1",
        "choice-2",
      ]);
      expect(result).toBe(true);
    });
  });

  describe("gradeMultiAnswerQuestion", () => {
    it("should return true when selections exactly match correct answers", () => {
      const selected = ["choice-1", "choice-3"];
      const correct = ["choice-1", "choice-3"];
      const result = gradeMultiAnswerQuestion(selected, correct);
      expect(result).toBe(true);
    });

    it("should return true regardless of order", () => {
      const selected = ["choice-3", "choice-1"];
      const correct = ["choice-1", "choice-3"];
      const result = gradeMultiAnswerQuestion(selected, correct);
      expect(result).toBe(true);
    });

    it("should return false when missing a correct answer", () => {
      const selected = ["choice-1"];
      const correct = ["choice-1", "choice-3"];
      const result = gradeMultiAnswerQuestion(selected, correct);
      expect(result).toBe(false);
    });

    it("should return false when extra incorrect answer selected", () => {
      const selected = ["choice-1", "choice-2", "choice-3"];
      const correct = ["choice-1", "choice-3"];
      const result = gradeMultiAnswerQuestion(selected, correct);
      expect(result).toBe(false);
    });

    it("should return false when completely wrong answers selected", () => {
      const selected = ["choice-2", "choice-4"];
      const correct = ["choice-1", "choice-3"];
      const result = gradeMultiAnswerQuestion(selected, correct);
      expect(result).toBe(false);
    });

    it("should return false when no answers selected but some are required", () => {
      const selected: string[] = [];
      const correct = ["choice-1"];
      const result = gradeMultiAnswerQuestion(selected, correct);
      expect(result).toBe(false);
    });

    it("should return true when no answers required and none selected", () => {
      const selected: string[] = [];
      const correct: string[] = [];
      const result = gradeMultiAnswerQuestion(selected, correct);
      expect(result).toBe(true);
    });
  });

  describe("gradeFreeTextExactMatch", () => {
    it("should return true for exact match", () => {
      const result = gradeFreeTextExactMatch("hello", "hello");
      expect(result).toBe(true);
    });

    it("should be case-insensitive", () => {
      const result = gradeFreeTextExactMatch("Hello", "hello");
      expect(result).toBe(true);
    });

    it("should trim whitespace", () => {
      const result = gradeFreeTextExactMatch("  hello  ", "hello");
      expect(result).toBe(true);
    });

    it("should return false for different answers", () => {
      const result = gradeFreeTextExactMatch("hello", "world");
      expect(result).toBe(false);
    });

    it("should return false for null response", () => {
      const result = gradeFreeTextExactMatch(null, "hello");
      expect(result).toBe(false);
    });

    it("should return false for null expected answer", () => {
      const result = gradeFreeTextExactMatch("hello", null);
      expect(result).toBe(false);
    });

    it("should handle numbers as strings", () => {
      const result = gradeFreeTextExactMatch("42", "42");
      expect(result).toBe(true);
    });

    it("should handle multi-word answers", () => {
      const result = gradeFreeTextExactMatch(
        "The quick brown fox",
        "the quick brown fox",
      );
      expect(result).toBe(true);
    });
  });
});
