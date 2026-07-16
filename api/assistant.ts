import { requestGeminiResponse, type GeminiClientResult } from "../server/geminiClient";
import { buildAssistantPrompt } from "../server/promptBuilder";
import { parseGeminiJson, validateStadiumAIResponse } from "../server/responseValidator";
import { validateAssistantRequestBody } from "../server/requestValidator";
import { generateOfflineAssistantResponse } from "../src/utils/assistant";
import { type StadiumAIResponse } from "../src/types";

const REQUEST_BODY_LIMIT = 2_048;

export type AssistantApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type AssistantApiResponse = {
  status(statusCode: number): AssistantApiResponse;
  json(body: unknown): void;
  setHeader?(name: string, value: string): void;
};

type AssistantHandlerDependencies = {
  geminiApiKey?: string | undefined;
  requestGemini?: (apiKey: string, prompt: string) => Promise<GeminiClientResult>;
};

export default async function handler(request: AssistantApiRequest, response: AssistantApiResponse): Promise<void> {
  await assistantHandler(request, response);
}

export async function assistantHandler(
  request: AssistantApiRequest,
  response: AssistantApiResponse,
  dependencies: AssistantHandlerDependencies = {}
): Promise<void> {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (!hasJsonContentType(request.headers)) {
    sendJson(response, 415, { error: "Content-Type must be application/json." });
    return;
  }

  const parsedBody = parseRequestBody(request.body);
  if (!parsedBody.valid) {
    sendJson(response, parsedBody.statusCode, { error: parsedBody.error });
    return;
  }

  const validation = validateAssistantRequestBody(parsedBody.body);
  if (!validation.valid) {
    sendJson(response, validation.statusCode, { error: validation.error });
    return;
  }

  const apiKey = readConfiguredGeminiApiKey(dependencies);
  if (apiKey === undefined) {
    sendJson(response, 200, generateOfflineAssistantResponse(validation.value.question, validation.value.language));
    return;
  }

  const prompt = buildAssistantPrompt(validation.value.question, validation.value.language);
  const geminiResult = await (dependencies.requestGemini ?? requestGeminiResponse)(apiKey, prompt);
  const aiResponse = toValidatedResponse(geminiResult);

  sendJson(
    response,
    200,
    aiResponse ?? generateOfflineAssistantResponse(validation.value.question, validation.value.language)
  );
}

function toValidatedResponse(result: GeminiClientResult): StadiumAIResponse | null {
  if (!result.ok) {
    return null;
  }

  try {
    return validateStadiumAIResponse(parseGeminiJson(result.text), "gemini");
  } catch {
    return null;
  }
}

function parseRequestBody(body: unknown): { valid: true; body: unknown } | { valid: false; statusCode: number; error: string } {
  if (typeof body === "string") {
    if (body.length > REQUEST_BODY_LIMIT) {
      return { valid: false, statusCode: 413, error: "Request body is too large." };
    }

    try {
      return { valid: true, body: JSON.parse(body) };
    } catch {
      return { valid: false, statusCode: 400, error: "Request body must be valid JSON." };
    }
  }

  return { valid: true, body };
}

function hasJsonContentType(headers: AssistantApiRequest["headers"]): boolean {
  const value = headers["content-type"] ?? headers["Content-Type"];
  const header = Array.isArray(value) ? value[0] : value;
  return typeof header === "string" && header.toLowerCase().includes("application/json");
}

function sendJson(response: AssistantApiResponse, statusCode: number, body: unknown): void {
  response.setHeader?.("Cache-Control", "no-store");
  response.status(statusCode).json(body);
}

function readGeminiApiKey(): string | undefined {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  const value = runtime.process?.env?.GEMINI_API_KEY;
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readConfiguredGeminiApiKey(dependencies: AssistantHandlerDependencies): string | undefined {
  if (Object.hasOwn(dependencies, "geminiApiKey")) {
    const value = dependencies.geminiApiKey;
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
  }

  return readGeminiApiKey();
}
