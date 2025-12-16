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
import { Textarea } from "@/components/ui/textarea";
import { createTestAction, updateTestAction } from "@/lib/actions/test";
import { CreateTestSchema, type Test } from "@/lib/models/test";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type TestFormData = z.infer<typeof CreateTestSchema>;

interface TestFormProps {
  test?: Test;
  trigger?: React.ReactNode;
}

export function TestForm({ test, trigger }: TestFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<TestFormData>({
    resolver: zodResolver(CreateTestSchema),
    defaultValues: {
      name: test?.name || "",
      description: test?.description || "",
    },
  });

  const onSubmit = async (data: TestFormData) => {
    try {
      const result = test
        ? await updateTestAction({ id: test.id, ...data })
        : await createTestAction(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(test ? "Test updated" : "Test created");
        setOpen(false);
        form.reset();

        if (!test && result.data) {
          router.push(`/maker/test/${result.data.id}`);
        } else {
          router.refresh();
        }
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
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
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Test
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{test ? "Edit Test" : "Create New Test"}</DialogTitle>
            <DialogDescription>
              {test
                ? "Update your test details"
                : "Create a new test to add questions and share with students"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Test Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Math Quiz Chapter 1"
                {...form.register("name")}
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a description for this test..."
                {...form.register("description")}
                rows={3}
              />
            </div>
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
                : test
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
