"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addChoiceAction,
  deleteChoiceAction,
  reorderChoicesAction,
  updateChoiceAction,
} from "@/lib/actions/question";
import type { ChoiceWithSignedUrls } from "@/lib/services/question";
import { ArrowDown, ArrowUp, Mic, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AudioRecorder } from "./audio-recorder";
import { ChoiceAudioDisplay } from "./choice-audio-display";

interface ChoiceManagerProps {
  questionId: string;
  questionType: "multi_choice" | "multi_answer" | "free_text";
  choices: ChoiceWithSignedUrls[];
  testId: string;
}

export function ChoiceManager({
  questionId,
  questionType,
  choices,
  testId,
}: ChoiceManagerProps) {
  const router = useRouter();
  const [newChoiceText, setNewChoiceText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  if (questionType === "free_text") {
    return null;
  }

  const handleAddChoice = async () => {
    if (!newChoiceText.trim()) {
      toast.error("Choice text is required");
      return;
    }

    setIsAdding(true);
    const result = await addChoiceAction({
      questionId,
      text: newChoiceText,
      orderIndex: String(choices.length),
      isCorrect: false,
    });

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setNewChoiceText("");
      toast.success("Choice added");
      router.refresh();
    }
    setIsAdding(false);
  };

  const handleToggleCorrect = async (choice: ChoiceWithSignedUrls) => {
    const newIsCorrect = !choice.isCorrect;

    if (questionType === "multi_choice" && newIsCorrect) {
      const otherCorrectChoices = choices.filter(
        (c) => c.id !== choice.id && c.isCorrect,
      );

      for (const otherChoice of otherCorrectChoices) {
        const unmarkResult = await updateChoiceAction({
          id: otherChoice.id,
          isCorrect: false,
        });

        if (unmarkResult.error) {
          toast.error(`Failed to unmark choice: ${unmarkResult.error}`);
          return;
        }
      }
    }

    const result = await updateChoiceAction({
      id: choice.id,
      isCorrect: newIsCorrect,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Choice updated");
      router.refresh();
    }
  };

  const handleUpdateChoiceText = async (
    choice: ChoiceWithSignedUrls,
    newText: string,
  ) => {
    if (!newText.trim()) {
      toast.error("Choice text is required");
      return;
    }

    const result = await updateChoiceAction({
      id: choice.id,
      text: newText,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Choice updated");
      router.refresh();
    }
  };

  const handleDeleteChoice = async (choiceId: string) => {
    const result = await deleteChoiceAction(choiceId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Choice deleted");
      router.refresh();
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newChoices = [...choices];
    [newChoices[index - 1], newChoices[index]] = [
      newChoices[index],
      newChoices[index - 1],
    ];

    const updates = newChoices.map((c, i) => ({
      id: c.id,
      orderIndex: String(i),
    }));

    const result = await reorderChoicesAction({
      questionId,
      updates,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      router.refresh();
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === choices.length - 1) return;

    const newChoices = [...choices];
    [newChoices[index], newChoices[index + 1]] = [
      newChoices[index + 1],
      newChoices[index],
    ];

    const updates = newChoices.map((c, i) => ({
      id: c.id,
      orderIndex: String(i),
    }));

    const result = await reorderChoicesAction({
      questionId,
      updates,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">
          Choices{" "}
          {questionType === "multi_choice"
            ? "(select one)"
            : "(select multiple)"}
        </Label>
      </div>

      {choices.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No choices yet. Add choices below.
        </p>
      )}

      <div className="space-y-2">
        {choices.map((choice, index) => (
          <ChoiceItem
            key={choice.id}
            choice={choice}
            index={index}
            totalChoices={choices.length}
            questionId={questionId}
            testId={testId}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            onToggleCorrect={() => handleToggleCorrect(choice)}
            onUpdateText={(newText) => handleUpdateChoiceText(choice, newText)}
            onDelete={() => handleDeleteChoice(choice.id)}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newChoiceText}
          onChange={(e) => setNewChoiceText(e.target.value)}
          placeholder="New choice text"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddChoice();
            }
          }}
        />
        <Button
          type="button"
          onClick={handleAddChoice}
          disabled={isAdding}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}

interface ChoiceItemProps {
  choice: ChoiceWithSignedUrls;
  index: number;
  totalChoices: number;
  questionId: string;
  testId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleCorrect: () => void;
  onUpdateText: (text: string) => void;
  onDelete: () => void;
}

function ChoiceItem({
  choice,
  index,
  totalChoices,
  questionId,
  testId,
  onMoveUp,
  onMoveDown,
  onToggleCorrect,
  onUpdateText,
  onDelete,
}: ChoiceItemProps) {
  const router = useRouter();
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  const handleAudioUpload = async (key: string) => {
    const result = await updateChoiceAction({
      id: choice.id,
      audioUrl: key,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      setShowAudioRecorder(false);
      router.refresh();
    }
  };

  const handleAudioRemove = async () => {
    const result = await updateChoiceAction({
      id: choice.id,
      audioUrl: null,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={index === 0}
            className="h-5 w-5 p-0"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={index === totalChoices - 1}
            className="h-5 w-5 p-0"
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Checkbox
            checked={choice.isCorrect}
            onCheckedChange={onToggleCorrect}
            aria-label={`Mark choice ${index + 1} as correct`}
            id={`choice-${choice.id}-correct`}
          />
          <Label
            htmlFor={`choice-${choice.id}-correct`}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            Correct
          </Label>
        </div>
        <Input
          defaultValue={choice.text}
          onBlur={(e) => {
            if (e.target.value !== choice.text) {
              onUpdateText(e.target.value);
            }
          }}
          placeholder={`Choice ${index + 1}`}
          className="flex-1"
        />
        {choice.audioSignedUrl && (
          <ChoiceAudioDisplay audioSignedUrl={choice.audioSignedUrl} />
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAudioRecorder(!showAudioRecorder)}
          className={showAudioRecorder ? "text-primary" : ""}
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {showAudioRecorder && (
        <div className="pl-8 pt-2 border-t">
          <AudioRecorder
            type="choice_audio"
            testId={testId}
            questionId={questionId}
            choiceId={choice.id}
            currentAudioSignedUrl={choice.audioSignedUrl}
            onUpload={handleAudioUpload}
            onRemove={handleAudioRemove}
          />
        </div>
      )}
    </div>
  );
}
