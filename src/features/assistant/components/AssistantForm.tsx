import { type FormEvent } from "react";
import {
  LANGUAGE_LABELS,
  MAX_ASSISTANT_INPUT_LENGTH,
  SUPPORTED_LANGUAGE_OPTIONS
} from "../../../shared/config/assistant";
import { validateLanguage } from "../../../shared/assistant/offlineAssistant";
import { type SupportedLanguage } from "../../../shared/contracts/stadium";

type AssistantFormProps = {
  question: string;
  language: SupportedLanguage;
  isLoading: boolean;
  onQuestionChange(question: string): void;
  onLanguageChange(language: SupportedLanguage): void;
  onSubmit(): Promise<void>;
};

export function AssistantForm({
  question,
  language,
  isLoading,
  onQuestionChange,
  onLanguageChange,
  onSubmit
}: AssistantFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void onSubmit();
  }

  return (
    <form className="assistant-form" onSubmit={handleSubmit}>
      <label htmlFor="assistant-question">Stadium question</label>
      <textarea
        id="assistant-question"
        value={question}
        required
        maxLength={MAX_ASSISTANT_INPUT_LENGTH}
        onChange={(event) => onQuestionChange(event.target.value)}
        aria-describedby="assistant-help assistant-count"
        placeholder="Where should a wheelchair user enter?"
        rows={4}
      />
      <div className="form-row">
        <label htmlFor="assistant-language">Response language</label>
        <select
          id="assistant-language"
          value={language}
          onChange={(event) => onLanguageChange(validateLanguage(event.target.value))}
        >
          {SUPPORTED_LANGUAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {LANGUAGE_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
      <p id="assistant-count" className="character-count">
        {question.length} / {MAX_ASSISTANT_INPUT_LENGTH} characters
      </p>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Generating recommendation..." : "Generate recommendation"}
      </button>
    </form>
  );
}
