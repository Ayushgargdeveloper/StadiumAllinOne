import { MAX_ASSISTANT_INPUT_LENGTH } from "../src/constants";
import { supportedLanguages, type AssistantApiRequestBody, type SupportedLanguage } from "../src/types";
import { sanitizeAssistantInput } from "../src/utils/assistant";

export type ValidatedAssistantRequest = {
  question: string;
  language: SupportedLanguage;
};

export type RequestValidationResult =
  | { valid: true; value: ValidatedAssistantRequest }
  | { valid: false; statusCode: number; error: string };

export function validateAssistantRequestBody(body: unknown): RequestValidationResult {
  if (!isRecord(body)) {
    return { valid: false, statusCode: 400, error: "Request body must be a JSON object." };
  }

  if (typeof body.question !== "string") {
    return { valid: false, statusCode: 400, error: "Question is required." };
  }

  const question = sanitizeAssistantInput(body.question);
  if (question.length === 0) {
    return { valid: false, statusCode: 400, error: "Question cannot be empty." };
  }

  if (question.length > MAX_ASSISTANT_INPUT_LENGTH) {
    return { valid: false, statusCode: 413, error: `Question must be ${MAX_ASSISTANT_INPUT_LENGTH} characters or fewer.` };
  }

  if (typeof body.language !== "string" || !supportedLanguages.includes(body.language as SupportedLanguage)) {
    return { valid: false, statusCode: 400, error: "Language is not supported." };
  }

  const language = body.language as SupportedLanguage;
  return { valid: true, value: { question, language } satisfies AssistantApiRequestBody };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
