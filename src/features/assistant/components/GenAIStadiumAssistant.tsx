import { FormEvent, useState } from "react";
import { LANGUAGE_LABELS, MAX_ASSISTANT_INPUT_LENGTH, SUPPORTED_LANGUAGE_OPTIONS } from "../../../shared/config/assistant";
import { type StadiumAIResponse, type SupportedLanguage } from "../../../shared/contracts/stadium";
import { requestAssistantResponse } from "../services/assistantClient";
import { generateOfflineAssistantResponse, validateLanguage } from "../../../shared/assistant/offlineAssistant";

const initialResponse: StadiumAIResponse = {
  answer: "Ask about navigation, crowd levels, accessibility, transportation, medical help, sustainability, or operations support.",
  intent: "unknown",
  recommendedAction: "Enter a stadium operations question and generate a recommendation.",
  urgency: "low",
  targetUser: "fan",
  sourceMode: "offline-fallback"
};

export function GenAIStadiumAssistant() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [response, setResponse] = useState<StadiumAIResponse>(initialResponse);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatusMessage("");

    try {
      const result = await requestAssistantResponse(question, language);
      setResponse(result);
    } catch {
      setResponse(generateOfflineAssistantResponse(question, language));
      setStatusMessage("Using offline fallback because the secure AI endpoint is unavailable.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="panel assistant-panel" aria-labelledby="assistant-heading">
      <div className="section-heading">
        <p className="eyebrow">Module 1</p>
        <h2 id="assistant-heading">Multilingual GenAI Stadium Assistant</h2>
      </div>
      <p id="assistant-help" className="section-copy">
        StadiumPulse AI sends validated stadium questions to a secure server-side Gemini endpoint and falls back to a safe offline engine when AI is unavailable.
      </p>
      <form className="assistant-form" onSubmit={handleSubmit}>
        <label htmlFor="assistant-question">Stadium question</label>
        <textarea
          id="assistant-question"
          value={question}
          maxLength={MAX_ASSISTANT_INPUT_LENGTH}
          onChange={(event) => setQuestion(event.target.value)}
          aria-describedby="assistant-help assistant-count"
          placeholder="Where should a wheelchair user enter?"
          rows={4}
        />
        <div className="form-row">
          <label htmlFor="assistant-language">Response language</label>
          <select
            id="assistant-language"
            value={language}
            onChange={(event) => setLanguage(validateLanguage(event.target.value))}
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
      <div className="assistant-response" aria-live="polite" aria-busy={isLoading}>
        <h3>Generated recommendation</h3>
        {statusMessage.length > 0 && (
          <p className="assistant-status" role="status">
            {statusMessage}
          </p>
        )}
        <p>{response.answer}</p>
        <dl className="decision-list">
          <div>
            <dt>Intent</dt>
            <dd>{response.intent}</dd>
          </div>
          <div>
            <dt>Urgency</dt>
            <dd>{response.urgency}</dd>
          </div>
          <div>
            <dt>Target user</dt>
            <dd>{response.targetUser}</dd>
          </div>
          <div>
            <dt>Source mode</dt>
            <dd>{response.sourceMode}</dd>
          </div>
          <div>
            <dt>Recommended action</dt>
            <dd>{response.recommendedAction}</dd>
          </div>
          {response.alternativeLocation !== undefined && (
            <div>
              <dt>Alternative location</dt>
              <dd>{response.alternativeLocation}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
