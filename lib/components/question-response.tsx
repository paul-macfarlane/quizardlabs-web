"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type {
  ChoiceWithSignedUrls,
  QuestionWithChoicesAndSignedUrls,
} from "@/lib/services/question";

import { ChoiceAudioDisplay } from "./choice-audio-display";
import { QuestionMediaDisplay } from "./question-media-display";

interface QuestionResponseProps {
  question: QuestionWithChoicesAndSignedUrls;
  questionNumber: number;
  selectedChoiceIds: string[];
  textResponse: string;
  onChoiceChange: (choiceIds: string[]) => void;
  onTextChange: (text: string) => void;
  disabled?: boolean;
}

export function QuestionResponse({
  question,
  questionNumber,
  selectedChoiceIds,
  textResponse,
  onChoiceChange,
  onTextChange,
  disabled = false,
}: QuestionResponseProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Q{questionNumber}
        </span>
      </div>

      <p className="text-lg font-medium whitespace-pre-wrap">{question.text}</p>

      <QuestionMediaDisplay
        imageSignedUrl={question.imageSignedUrl}
        audioSignedUrl={question.audioSignedUrl}
      />

      {question.type === "multi_choice" && (
        <MultiChoiceInput
          choices={question.choices}
          selectedId={selectedChoiceIds[0] || null}
          onChange={(id) => onChoiceChange(id ? [id] : [])}
          disabled={disabled}
        />
      )}

      {question.type === "multi_answer" && (
        <MultiAnswerInput
          choices={question.choices}
          selectedIds={selectedChoiceIds}
          onChange={onChoiceChange}
          disabled={disabled}
        />
      )}

      {question.type === "free_text" && (
        <FreeTextInput
          value={textResponse}
          onChange={onTextChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}

interface MultiChoiceInputProps {
  choices: ChoiceWithSignedUrls[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
}

function MultiChoiceInput({
  choices,
  selectedId,
  onChange,
  disabled,
}: MultiChoiceInputProps) {
  return (
    <RadioGroup
      value={selectedId || ""}
      onValueChange={(value) => onChange(value || null)}
      disabled={disabled}
      className="space-y-2"
    >
      {choices.map((choice) => (
        <Label
          key={choice.id}
          htmlFor={`choice-${choice.id}`}
          className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <RadioGroupItem value={choice.id} id={`choice-${choice.id}`} />
          <span className="flex-1 font-normal">{choice.text}</span>
          {choice.audioSignedUrl && (
            <ChoiceAudioDisplay audioSignedUrl={choice.audioSignedUrl} />
          )}
        </Label>
      ))}
    </RadioGroup>
  );
}

interface MultiAnswerInputProps {
  choices: ChoiceWithSignedUrls[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

function MultiAnswerInput({
  choices,
  selectedIds,
  onChange,
  disabled,
}: MultiAnswerInputProps) {
  const handleToggle = (choiceId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, choiceId]);
    } else {
      onChange(selectedIds.filter((id) => id !== choiceId));
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Select all that apply</p>
      {choices.map((choice) => (
        <Label
          key={choice.id}
          htmlFor={`choice-${choice.id}`}
          className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <Checkbox
            id={`choice-${choice.id}`}
            checked={selectedIds.includes(choice.id)}
            onCheckedChange={(checked) =>
              handleToggle(choice.id, checked === true)
            }
            disabled={disabled}
          />
          <span className="flex-1 font-normal">{choice.text}</span>
          {choice.audioSignedUrl && (
            <ChoiceAudioDisplay audioSignedUrl={choice.audioSignedUrl} />
          )}
        </Label>
      ))}
    </div>
  );
}

interface FreeTextInputProps {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}

function FreeTextInput({ value, onChange, disabled }: FreeTextInputProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer here..."
      rows={4}
      disabled={disabled}
      className="resize-none"
    />
  );
}
