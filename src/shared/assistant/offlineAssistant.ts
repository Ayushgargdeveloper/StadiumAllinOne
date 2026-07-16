import { DEFAULT_LANGUAGE, MAX_ASSISTANT_INPUT_LENGTH } from "../config/assistant";
import { stadiumContext } from "../stadium/stadiumData";
import {
  assistantIntents,
  supportedLanguages,
  type AssistantIntent,
  type AssistantResult,
  type StadiumAIResponse,
  type SupportedLanguage
} from "../contracts/stadium";
import {
  alternativeLocations,
  fallbackResponses,
  intentKeywords,
  recommendedActions,
  responseTemplates,
  targetUserByIntent,
  urgencyByIntent,
  type OfflineFailureReason
} from "./offlineAssistantRules";

type AssistantErrorResult = Extract<AssistantResult, { status: "error" }>;

export function sanitizeAssistantInput(input: string): string {
  return [...input]
    .filter((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint !== undefined && codePoint > 31 && codePoint !== 127;
    })
    .join("")
    .trim();
}

export function validateLanguage(language: string): SupportedLanguage {
  return supportedLanguages.includes(language as SupportedLanguage)
    ? (language as SupportedLanguage)
    : DEFAULT_LANGUAGE;
}

export function detectIntent(input: string): AssistantIntent | null {
  const normalizedInput = input.toLowerCase();
  const rankedIntent = assistantIntents
    .map((intent) => ({
      intent,
      score: intentKeywords[intent].filter((keyword) => normalizedInput.includes(keyword)).length
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)[0];

  return rankedIntent?.intent ?? null;
}

export function generateAssistantResponse(rawInput: string, rawLanguage: string): AssistantResult {
  const language = validateLanguage(rawLanguage);
  const sanitizedInput = sanitizeAssistantInput(rawInput);

  if (sanitizedInput.length === 0) {
    return createErrorResult(language, "empty");
  }

  if (sanitizedInput.length > MAX_ASSISTANT_INPUT_LENGTH) {
    return createErrorResult(language, "too-long");
  }

  const intent = detectIntent(sanitizedInput);
  if (intent === null) {
    return createErrorResult(language, "unknown-intent");
  }

  const response = responseTemplates[language][intent].replace("{context}", stadiumContext[intent]);
  return {
    status: "success",
    language,
    intent,
    response,
    structuredResponse: createStructuredFallback(intent, response)
  };
}

export function generateOfflineAssistantResponse(rawInput: string, rawLanguage: string): StadiumAIResponse {
  return generateAssistantResponse(rawInput, rawLanguage).structuredResponse;
}

function createErrorResult(language: SupportedLanguage, reason: OfflineFailureReason): AssistantErrorResult {
  const response = fallbackResponses[language][reason];
  return {
    status: "error",
    language,
    reason,
    response,
    structuredResponse: createUnknownFallback(response)
  };
}

function createStructuredFallback(intent: AssistantIntent, answer: string): StadiumAIResponse {
  return {
    answer,
    intent,
    recommendedAction: recommendedActions[intent],
    alternativeLocation: alternativeLocations[intent],
    urgency: urgencyByIntent[intent],
    targetUser: targetUserByIntent[intent],
    sourceMode: "offline-fallback"
  };
}

function createUnknownFallback(answer: string): StadiumAIResponse {
  return {
    answer,
    intent: "unknown",
    recommendedAction:
      "Ask a stadium operations question about navigation, crowding, accessibility, transportation, medical help, sustainability, or operations support.",
    urgency: "low",
    targetUser: "fan",
    sourceMode: "offline-fallback"
  };
}
