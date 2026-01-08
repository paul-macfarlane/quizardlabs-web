"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  addQuestionAction,
  updateQuestionAction,
} from "@/lib/actions/question";
import {
  AddQuestionSchema,
  FREE_TEXT_MODES,
  QUESTION_TYPES,
  type Question,
  getFreeTextModeDisplayName,
  getQuestionTypeDisplayName,
} from "@/lib/models/question";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type QuestionFormData = z.infer<typeof AddQuestionSchema>;

interface QuestionFormProps {
  testId: string;
  question?: Question;
  questionCount: number;
  trigger?: React.ReactNode;
}

export function QuestionForm({
  testId,
  question,
  questionCount,
  trigger,
}: QuestionFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(AddQuestionSchema),
    defaultValues: {
      testId,
      text: question?.text || "",
      type: question?.type || "multi_choice",
      orderIndex: question?.orderIndex || String(questionCount),
      freeTextMode: question?.freeTextMode || null,
      expectedAnswer: question?.expectedAnswer || null,
    },
  });

  const questionType = useWatch({
    control: form.control,
    name: "type",
    defaultValue: question?.type || "multi_choice",
  });

  const freeTextMode = useWatch({
    control: form.control,
    name: "freeTextMode",
    defaultValue: question?.freeTextMode || null,
  });

  const onSubmit = async (data: QuestionFormData) => {
    const result = question
      ? await updateQuestionAction({ id: question.id, ...data })
      : await addQuestionAction(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(question ? "Question updated" : "Question added");
      setOpen(false);
      form.reset();
      router.refresh();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {question ? "Edit Question" : "Add Question"}
            </DialogTitle>
            <DialogDescription>
              {question
                ? "Update the question details"
                : "Add a new question to this test"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text">Question Text *</Label>
              <Textarea
                id="text"
                placeholder="Enter the question..."
                {...form.register("text")}
                aria-invalid={!!form.formState.errors.text}
                rows={3}
              />
              {form.formState.errors.text && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.text.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Question Type *</Label>
              <RadioGroup
                value={questionType}
                onValueChange={(value) => {
                  form.setValue(
                    "type",
                    value as "multi_choice" | "multi_answer" | "free_text",
                  );
                  if (value !== "free_text") {
                    form.setValue("freeTextMode", null);
                    form.setValue("expectedAnswer", null);
                  }
                }}
              >
                {QUESTION_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <Label
                      htmlFor={type}
                      className="font-normal cursor-pointer"
                    >
                      {getQuestionTypeDisplayName(type)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {questionType === "free_text" && (
              <>
                <div className="space-y-2">
                  <Label>Grading Mode *</Label>
                  <RadioGroup
                    value={freeTextMode || ""}
                    onValueChange={(value) => {
                      form.setValue(
                        "freeTextMode",
                        value as "exact_match" | "manual",
                      );
                      if (value !== "exact_match") {
                        form.setValue("expectedAnswer", null);
                      }
                    }}
                  >
                    {FREE_TEXT_MODES.map((mode) => (
                      <div key={mode} className="flex items-center space-x-2">
                        <RadioGroupItem value={mode} id={mode} />
                        <Label
                          htmlFor={mode}
                          className="font-normal cursor-pointer"
                        >
                          {getFreeTextModeDisplayName(mode)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    Exact Match: Auto-grades based on text comparison. Manual:
                    Teacher grades each response.
                  </p>
                </div>

                {freeTextMode === "exact_match" && (
                  <div className="space-y-2">
                    <Label htmlFor="expectedAnswer">Expected Answer *</Label>
                    <Input
                      id="expectedAnswer"
                      placeholder="Enter the correct answer..."
                      {...form.register("expectedAnswer")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Case-insensitive comparison will be used.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : question
                  ? "Update"
                  : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
