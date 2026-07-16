import { useState } from "react";
import { generateOfflineAssistantResponse } from "../../../shared/assistant/offlineAssistant";
import { type StadiumAIResponse, type SupportedLanguage } from "../../../shared/contracts/stadium";
import { requestAssistantResponse } from "../services/assistantClient";

const OFFLINE_STATUS = "Using offline fallback because the secure AI endpoint is unavailable.";

const initialResponse: StadiumAIResponse = {
  answer:
    "Ask about navigation, crowd levels, accessibility, transportation, medical help, sustainability, or operations support.",
  intent: "unknown",
  recommendedAction: "Enter a stadium operations question and generate a recommendation.",
  urgency: "low",
  targetUser: "fan",
  sourceMode: "offline-fallback"
};

export function useAssistant() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [response, setResponse] = useState<StadiumAIResponse>(initialResponse);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(): Promise<void> {
    setIsLoading(true);
    setStatusMessage("");

    try {
      setResponse(await requestAssistantResponse(question, language));
    } catch {
      setResponse(generateOfflineAssistantResponse(question, language));
      setStatusMessage(OFFLINE_STATUS);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    question,
    setQuestion,
    language,
    setLanguage,
    response,
    statusMessage,
    isLoading,
    submit
  };
}
