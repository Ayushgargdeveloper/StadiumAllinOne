import {
  isPostRequest,
  parseAssistantRequest,
  readClientIdentifier,
  sendAssistantError,
  sendAssistantJson,
  type AssistantApiRequest,
  type AssistantApiResponse
} from "./assistantHttp";
import { resolveAssistantResponse, type AssistantProviderDependencies } from "./assistantService";
import { checkInMemoryRateLimit, type RateLimitDecision } from "./rateLimiter";

export type { AssistantApiRequest, AssistantApiResponse } from "./assistantHttp";
export type { AssistantFallbackEvent, AssistantFallbackReason } from "./assistantService";

export type AssistantHandlerDependencies = AssistantProviderDependencies & {
  createRequestId?: () => string;
  checkRateLimit?: (identifier: string) => Promise<RateLimitDecision> | RateLimitDecision;
};

export async function assistantHandler(
  request: AssistantApiRequest,
  response: AssistantApiResponse,
  dependencies: AssistantHandlerDependencies = {}
): Promise<void> {
  const requestId = createRequestId(dependencies.createRequestId);

  if (!isPostRequest(request)) {
    sendAssistantError(
      response,
      {
        statusCode: 405,
        error: "Method not allowed.",
        code: "METHOD_NOT_ALLOWED"
      },
      requestId,
      { Allow: "POST" }
    );
    return;
  }

  const rateLimit = await checkRequestRateLimit(request, dependencies.checkRateLimit);
  if (!rateLimit.allowed) {
    sendAssistantError(
      response,
      {
        statusCode: 429,
        error: "Too many assistant requests. Please retry shortly.",
        code: "RATE_LIMITED"
      },
      requestId,
      { "Retry-After": String(rateLimit.retryAfterSeconds) }
    );
    return;
  }

  const parsedRequest = parseAssistantRequest(request);
  if (!parsedRequest.valid) {
    sendAssistantError(response, parsedRequest.issue, requestId);
    return;
  }

  const { question, language } = parsedRequest.value;
  const body = await resolveAssistantResponse(question, language, requestId, dependencies);
  sendAssistantJson(response, { statusCode: 200, body, requestId });
}

async function checkRequestRateLimit(
  request: AssistantApiRequest,
  rateLimitOverride: AssistantHandlerDependencies["checkRateLimit"]
): Promise<RateLimitDecision> {
  const checkRateLimit = rateLimitOverride ?? checkInMemoryRateLimit;
  return checkRateLimit(readClientIdentifier(request.headers));
}

function createRequestId(requestIdFactory: AssistantHandlerDependencies["createRequestId"]): string {
  return requestIdFactory?.() ?? randomRequestId();
}

function randomRequestId(): string {
  const runtime = globalThis as typeof globalThis & { crypto?: { randomUUID?: () => string } };
  return runtime.crypto?.randomUUID?.() ?? `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
