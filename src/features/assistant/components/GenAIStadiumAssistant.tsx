import { AssistantForm } from "./AssistantForm";
import { AssistantRecommendation } from "./AssistantRecommendation";
import { useAssistant } from "../hooks/useAssistant";

export function GenAIStadiumAssistant() {
  const assistant = useAssistant();

  return (
    <section className="panel assistant-panel" aria-labelledby="assistant-heading">
      <div className="section-heading">
        <p className="eyebrow">Module 1</p>
        <h2 id="assistant-heading">Multilingual GenAI Stadium Assistant</h2>
      </div>
      <p id="assistant-help" className="section-copy">
        StadiumPulse AI sends validated stadium questions to a secure server-side Gemini endpoint and falls back to a
        safe offline engine when AI is unavailable.
      </p>
      <AssistantForm
        question={assistant.question}
        language={assistant.language}
        isLoading={assistant.isLoading}
        onQuestionChange={assistant.setQuestion}
        onLanguageChange={assistant.setLanguage}
        onSubmit={assistant.submit}
      />
      <AssistantRecommendation
        response={assistant.response}
        statusMessage={assistant.statusMessage}
        isLoading={assistant.isLoading}
      />
    </section>
  );
}
