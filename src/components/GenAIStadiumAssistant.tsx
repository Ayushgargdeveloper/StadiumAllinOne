import { FormEvent, useState } from "react";
import { LANGUAGE_LABELS, MAX_ASSISTANT_INPUT_LENGTH, SUPPORTED_LANGUAGE_OPTIONS } from "../constants";
import { generateAssistantResponse } from "../utils/assistant";

export function GenAIStadiumAssistant() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("en");
  const [response, setResponse] = useState("Ask about navigation, crowd levels, accessibility, transportation, medical help, sustainability, or staff support.");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = generateAssistantResponse(question, language);
    setResponse(result.response);
  }

  return (
    <section className="panel assistant-panel" aria-labelledby="assistant-heading">
      <div className="section-heading">
        <p className="eyebrow">Module 1</p>
        <h2 id="assistant-heading">Multilingual GenAI Stadium Assistant</h2>
      </div>
      <p id="assistant-help" className="section-copy">
        StadiumPulse AI demonstrates a safe offline GenAI workflow using intent recognition, contextual stadium information retrieval, multilingual response generation, and operational decision-support templates.
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
          <select id="assistant-language" value={language} onChange={(event) => setLanguage(event.target.value)}>
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
        <button type="submit">Generate recommendation</button>
      </form>
      <div className="assistant-response" aria-live="polite">
        <h3>Generated recommendation</h3>
        <p>{response}</p>
      </div>
    </section>
  );
}
