import {
  createAssistantApiErrorPayload,
  type AssistantApiErrorCode
} from "./apiErrors";
import { requestGeminiResponse, type GeminiClientResult } from "./geminiClient";
import { buildAssistantPrompt } from "./promptBuilder";
import { checkInMemoryRateLimit, type RateLimitDecision } from "./rateLimiter";
import { parseGeminiJson, validateStadiumAIResponse } from "./responseValidator";
import { validateAssistantRequestBody } from "./requestValidator";
import { generateOfflineAssistantResponse } from "../src/shared/assistant/offlineAssistant";
import { type StadiumAIResponse } from "../src/shared/contracts/stadium";

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
  createRequestId?: () => string;
  checkRateLimit?: (identifier: string) => Promise<RateLimitDecision> | RateLimitDecision;
  recordFallback?: (event: AssistantFallbackEvent) => void;
};

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

export async function assistantHandler(
  request: AssistantApiRequest,
  response: AssistantApiResponse,
  dependencies: AssistantHandlerDependencies = {}
): Promise<void> {
  const requestId = createRequestId(dependencies);

  if (request.method !== "POST") {
    sendError(response, 405, "Method not allowed.", "METHOD_NOT_ALLOWED", requestId);
    return;
  }

  const rateLimit = await checkRequestRateLimit(request, dependencies);
  if (!rateLimit.allowed) {
    sendError(response, 429, "Too many assistant requests. Please retry shortly.", "RATE_LIMITED", requestId, {
      "Retry-After": String(rateLimit.retryAfterSeconds)
    });
    return;
  }

  if (!hasJsonContentType(request.headers)) {
    sendError(response, 415, "Content-Type must be application/json.", "UNSUPPORTED_CONTENT_TYPE", requestId);
    return;
  }

  const parsedBody = parseRequestBody(request.body);
  if (!parsedBody.valid) {
    sendError(response, parsedBody.statusCode, parsedBody.error, parsedBody.code, requestId);
    return;
  }

  const validation = validateAssistantRequestBody(parsedBody.body);
  if (!validation.valid) {
    sendError(response, validation.statusCode, validation.error, validationErrorCode(validation.statusCode), requestId);
    return;
  }

  const apiKey = readConfiguredGeminiApiKey(dependencies);
  if (apiKey === undefined) {
    recordFallback(dependencies, { requestId, reason: "missing-api-key" });
    sendJson(response, 200, generateOfflineAssistantResponse(validation.value.question, validation.value.language), requestId);
    return;
  }

  const prompt = buildAssistantPrompt(validation.value.question, validation.value.language);
  const geminiResult = await (dependencies.requestGemini ?? requestGeminiResponse)(apiKey, prompt);
  const aiResult = toValidatedResponse(geminiResult);

  if (aiResult.response !== null) {
    sendJson(response, 200, aiResult.response, requestId);
    return;
  }

  recordFallback(dependencies, { requestId, reason: aiResult.fallbackReason });
  sendJson(response, 200, generateOfflineAssistantResponse(validation.value.question, validation.value.language), requestId);
}

function toValidatedResponse(
  result: GeminiClientResult
): { response: StadiumAIResponse; fallbackReason?: never } | { response: null; fallbackReason: AssistantFallbackReason } {
  if (!result.ok) {
    return { response: null, fallbackReason: providerFailureReason(result.reason) };
  }

  let parsedResponse: unknown;
  try {
    parsedResponse = parseGeminiJson(result.text);
  } catch {
    return { response: null, fallbackReason: "model-invalid-json" };
  }

  const response = validateStadiumAIResponse(parsedResponse, "gemini");
  return response === null
    ? { response: null, fallbackReason: "model-invalid-schema" }
    : { response };
}

function parseRequestBody(
  body: unknown
): { valid: true; body: unknown } | { valid: false; statusCode: number; error: string; code: AssistantApiErrorCode } {
  if (typeof body === "string") {
    if (body.length > REQUEST_BODY_LIMIT) {
      return { valid: false, statusCode: 413, error: "Request body is too large.", code: "REQUEST_TOO_LARGE" };
    }

    try {
      return { valid: true, body: JSON.parse(body) };
    } catch {
      return { valid: false, statusCode: 400, error: "Request body must be valid JSON.", code: "INVALID_JSON" };
    }
  }

  return { valid: true, body };
}

function hasJsonContentType(headers: AssistantApiRequest["headers"]): boolean {
  const header = readHeader(headers, "content-type");
  const mediaType = header?.split(";", 1)[0]?.trim().toLowerCase();
  return mediaType === "application/json";
}

function sendError(
  response: AssistantApiResponse,
  statusCode: number,
  error: string,
  code: AssistantApiErrorCode,
  requestId: string,
  headers: Record<string, string> = {}
): void {
  sendJson(response, statusCode, createAssistantApiErrorPayload(error, code, requestId), requestId, headers);
}

function sendJson(
  response: AssistantApiResponse,
  statusCode: number,
  body: unknown,
  requestId: string,
  headers: Record<string, string> = {}
): void {
  response.setHeader?.("Cache-Control", "no-store");
  response.setHeader?.("X-Request-Id", requestId);
  for (const [name, value] of Object.entries(headers)) {
    response.setHeader?.(name, value);
  }
  response.status(statusCode).json(body);
}

function readGeminiApiKey(): string | undefined {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  const value = runtime.process?.env?.GEMINI_API_KEY;
  return normalizeApiKey(value);
}

function readConfiguredGeminiApiKey(dependencies: AssistantHandlerDependencies): string | undefined {
  if (Object.hasOwn(dependencies, "geminiApiKey")) {
    return normalizeApiKey(dependencies.geminiApiKey);
  }

  return readGeminiApiKey();
}

function normalizeApiKey(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue !== undefined && normalizedValue.length > 0 ? normalizedValue : undefined;
}

function validationErrorCode(statusCode: number): AssistantApiErrorCode {
  return statusCode === 413 ? "REQUEST_TOO_LARGE" : "INVALID_REQUEST";
}

function providerFailureReason(reason: Extract<GeminiClientResult, { ok: false }>["reason"]): AssistantFallbackReason {
  if (reason === "timeout") {
    return "provider-timeout";
  }

  return reason === "invalid-response" ? "provider-invalid-response" : "provider-api-error";
}

function recordFallback(dependencies: AssistantHandlerDependencies, event: AssistantFallbackEvent): void {
  try {
    dependencies.recordFallback?.(event);
  } catch {
    return;
  }
}

async function checkRequestRateLimit(
  request: AssistantApiRequest,
  dependencies: AssistantHandlerDependencies
): Promise<RateLimitDecision> {
  const identifier = readClientIdentifier(request.headers);
  const checkRateLimit = dependencies.checkRateLimit ?? checkInMemoryRateLimit;
  return checkRateLimit(identifier);
}

function readClientIdentifier(headers: AssistantApiRequest["headers"]): string {
  const forwardedFor = readHeader(headers, "x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedFor !== undefined && forwardedFor.length > 0) {
    return forwardedFor;
  }

  return readHeader(headers, "x-real-ip") ?? readHeader(headers, "cf-connecting-ip") ?? "anonymous";
}

function readHeader(headers: AssistantApiRequest["headers"], headerName: string): string | undefined {
  const entry = Object.entries(headers).find(([name]) => name.toLowerCase() === headerName);
  const value = entry?.[1];
  return Array.isArray(value) ? value[0] : value;
}

function createRequestId(dependencies: AssistantHandlerDependencies): string {
  return dependencies.createRequestId?.() ?? randomRequestId();
}

function randomRequestId(): string {
  const runtime = globalThis as typeof globalThis & { crypto?: { randomUUID?: () => string } };
  return runtime.crypto?.randomUUID?.() ?? `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
