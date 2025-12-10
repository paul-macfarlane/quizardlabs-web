"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { setUserRoleAction } from "@/lib/actions/user";
import { useActionState } from "react";

export function RoleSelector() {
  const [state, formAction, isPending] = useActionState(setUserRoleAction, {
    success: false,
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Quizardlabs
        </h1>
        <p className="text-muted-foreground">
          Please select your role to get started
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <Label htmlFor="test_maker" className="block cursor-pointer">
          <Card className="transition-all hover:border-primary has-checked-border-primary has-checked-ring-2 has-checked-ring-primary">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="test_maker"
                  name="role"
                  value="test_maker"
                  required
                  className="w-4 h-4"
                />
                <CardTitle>Teacher</CardTitle>
              </div>
              <CardDescription>
                Create and manage tests with audio dictation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Build digital tests</li>
                <li>• Add questions and answer choices</li>
                <li>• Record audio dictation for questions</li>
                <li>• Upload images and media</li>
              </ul>
            </CardContent>
          </Card>
        </Label>

        <Label htmlFor="test_taker" className="block cursor-pointer">
          <Card className="transition-all hover:border-primary has-checked-border-primary has-checked-ring-2 has-checked-ring-primary">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="test_taker"
                  name="role"
                  value="test_taker"
                  required
                  className="w-4 h-4"
                />
                <CardTitle>Student</CardTitle>
              </div>
              <CardDescription>
                Take tests with audio accommodations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Access assigned tests</li>
                <li>• Listen to teacher-recorded audio</li>
                <li>• Answer questions at your own pace</li>
                <li>• Submit completed tests</li>
              </ul>
            </CardContent>
          </Card>
        </Label>

        {state.error && (
          <div className="text-sm text-red-600 text-center">{state.error}</div>
        )}

        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending ? "Setting up..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
