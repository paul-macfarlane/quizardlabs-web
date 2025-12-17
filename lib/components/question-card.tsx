"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteQuestionAction } from "@/lib/actions/question";
import { type Choice, type Question } from "@/lib/models/question";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ChoiceManager } from "./choice-manager";
import { QuestionForm } from "./question-form";

interface QuestionCardProps {
  question: Question & { choices?: Choice[] };
  questionCount: number;
  testId: string;
}

export function QuestionCard({
  question,
  questionCount,
  testId,
}: QuestionCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setShowDeleteDialog(false);

    const result = await deleteQuestionAction(question.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Question deleted");
      router.refresh();
    }

    setDeleting(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg">
                Question {parseInt(question.orderIndex) + 1}
              </CardTitle>
              <CardDescription className="mt-1">
                {question.type
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  disabled={deleting}
                >
                  <MoreVertical className="w-4 h-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <QuestionForm
                  testId={testId}
                  question={question}
                  questionCount={questionCount}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm sm:text-base whitespace-pre-wrap">
            {question.text}
          </p>

          {(question.type === "multi_choice" ||
            question.type === "multi_answer") && (
            <div className="space-y-3">
              {question.choices && question.choices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Choices:
                  </p>
                  <ul className="space-y-1">
                    {question.choices.map((choice) => (
                      <li
                        key={choice.id}
                        className={`text-sm px-3 py-2 rounded ${
                          choice.isCorrect
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-muted"
                        }`}
                      >
                        {choice.text}
                        {choice.isCorrect && (
                          <span className="ml-2 text-xs font-medium">
                            ✓ Correct
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <details className="border-t pt-3">
                <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                  Manage choices
                </summary>
                <div className="pt-4">
                  <ChoiceManager
                    questionId={question.id}
                    questionType={question.type}
                    choices={question.choices || []}
                  />
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              question and all its choices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
