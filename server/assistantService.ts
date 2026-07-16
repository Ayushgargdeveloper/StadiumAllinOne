import { generateOfflineAssistantResponse } from "../src/shared/assistant/offlineAssistant";
import { type StadiumAIResponse, type SupportedLanguage } from "../src/shared/contracts/stadium";
import { requestGeminiResponse, type GeminiClientResult } from "./geminiClient";
import { buildAssistantPrompt } from "./promptBuilder";
import { parseGeminiJson, validateStadiumAIResponse } from "./responseValidator";
import { normalizeGeminiApiKey, readGeminiApiKey } from "./runtimeConfig";

export type AssistantFallbackReason =
  | "missing-api-key"
  | "provider-api-error"
  | "provider-timeout"
  | "provider-invalid-response"
  | "model-invalid-json"
  | "model-invalid-schema";

export type AssistantFallbackEvent = {
  requestId: string;
  reason: AssistantFallbackReason;
};

export type AssistantProviderDependencies = {
  geminiApiKey?: string | undefined;
  requestGemini?: (apiKey: string, prompt: string) => Promise<GeminiClientResult>;
  recordFallback?: (event: AssistantFallbackEvent) => void;
};

type AssistantProviderResult =
  { ok: true; response: StadiumAIResponse } | { ok: false; reason: AssistantFallbackReason };

type FallbackRequest = {
  question: string;
  language: SupportedLanguage;
  requestId: string;
  reason: AssistantFallbackReason;
};

const providerFailureReasons: Record<Extract<GeminiClientResult, { ok: false }>["reason"], AssistantFallbackReason> = {
  "api-error": "provider-api-error",
  timeout: "provider-timeout",
  "invalid-response": "provider-invalid-response"
};

export async function resolveAssistantResponse(
  question: string,
  language: SupportedLanguage,
  requestId: string,
  dependencies: AssistantProviderDependencies = {}
): Promise<StadiumAIResponse> {
  const apiKey = readConfiguredGeminiApiKey(dependencies);
  if (apiKey === undefined) {
    return createFallbackResponse({ question, language, requestId, reason: "missing-api-key" }, dependencies);
  }

  const prompt = buildAssistantPrompt(question, language);
  const requestGemini = dependencies.requestGemini ?? requestGeminiResponse;
  const providerResult = await requestGemini(apiKey, prompt);
  const validatedResult = validateProviderResult(providerResult);

  if (validatedResult.ok) {
    return validatedResult.response;
  }

  return createFallbackResponse({ question, language, requestId, reason: validatedResult.reason }, dependencies);
}

function validateProviderResult(result: GeminiClientResult): AssistantProviderResult {
  if (!result.ok) {
    return { ok: false, reason: providerFailureReasons[result.reason] };
  }

  const parsedResult = parseProviderJson(result.text);
  if (!parsedResult.valid) {
    return { ok: false, reason: "model-invalid-json" };
  }

  const response = validateStadiumAIResponse(parsedResult.value, "gemini");
  return response === null ? { ok: false, reason: "model-invalid-schema" } : { ok: true, response };
}

function parseProviderJson(text: string): { valid: true; value: unknown } | { valid: false } {
  try {
    return { valid: true, value: parseGeminiJson(text) };
  } catch {
    return { valid: false };
  }
}

function createFallbackResponse(
  request: FallbackRequest,
  dependencies: AssistantProviderDependencies
): StadiumAIResponse {
  recordFallback(dependencies.recordFallback, { requestId: request.requestId, reason: request.reason });
  return generateOfflineAssistantResponse(request.question, request.language);
}

function recordFallback(
  observer: AssistantProviderDependencies["recordFallback"],
  event: AssistantFallbackEvent
): void {
  try {
    observer?.(event);
  } catch {
    // Telemetry must never make the user-facing fallback unavailable.
  }
}

function readConfiguredGeminiApiKey(dependencies: AssistantProviderDependencies): string | undefined {
  return Object.hasOwn(dependencies, "geminiApiKey")
    ? normalizeGeminiApiKey(dependencies.geminiApiKey)
    : readGeminiApiKey();
}
