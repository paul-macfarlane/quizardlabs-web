import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGradeColorClass(score: number, maxScore: number): string {
  if (maxScore === 0) return "text-muted-foreground";
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return "text-grade-a";
  if (percentage >= 80) return "text-grade-b";
  if (percentage >= 70) return "text-grade-c";
  if (percentage >= 60) return "text-grade-d";
  return "text-destructive";
}
