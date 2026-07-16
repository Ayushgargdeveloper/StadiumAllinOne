import { createAssistantApiErrorPayload, type AssistantApiErrorCode } from "./apiErrors";
import { validateAssistantRequestBody, type ValidatedAssistantRequest } from "./requestValidator";

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

export type AssistantHttpError = {
  statusCode: number;
  error: string;
  code: AssistantApiErrorCode;
};

type RequestParseResult =
  { valid: true; value: ValidatedAssistantRequest } | { valid: false; issue: AssistantHttpError };

type BodyParseResult = { valid: true; value: unknown } | { valid: false; issue: AssistantHttpError };

type JsonResponse = {
  statusCode: number;
  body: unknown;
  requestId: string;
  headers?: Record<string, string> | undefined;
};

export function isPostRequest(request: AssistantApiRequest): boolean {
  return request.method === "POST";
}

export function parseAssistantRequest(request: AssistantApiRequest): RequestParseResult {
  if (!hasJsonContentType(request.headers)) {
    return invalidRequest(415, "Content-Type must be application/json.", "UNSUPPORTED_CONTENT_TYPE");
  }

  const parsedBody = parseRequestBody(request.body);
  if (!parsedBody.valid) {
    return parsedBody;
  }

  const validation = validateAssistantRequestBody(parsedBody.value);
  if (!validation.valid) {
    const code = validation.statusCode === 413 ? "REQUEST_TOO_LARGE" : "INVALID_REQUEST";
    return invalidRequest(validation.statusCode, validation.error, code);
  }

  return { valid: true, value: validation.value };
}

export function sendAssistantError(
  response: AssistantApiResponse,
  issue: AssistantHttpError,
  requestId: string,
  headers?: Record<string, string>
): void {
  sendAssistantJson(response, {
    statusCode: issue.statusCode,
    body: createAssistantApiErrorPayload(issue.error, issue.code, requestId),
    requestId,
    headers
  });
}

export function sendAssistantJson(response: AssistantApiResponse, payload: JsonResponse): void {
  const setHeader = response.setHeader?.bind(response);
  if (setHeader !== undefined) {
    setHeader("Cache-Control", "no-store");
    setHeader("X-Request-Id", payload.requestId);
    setResponseHeaders(setHeader, payload.headers);
  }

  response.status(payload.statusCode).json(payload.body);
}

export function readClientIdentifier(headers: AssistantApiRequest["headers"]): string {
  const forwardedFor = firstForwardedAddress(readHeader(headers, "x-forwarded-for"));
  return forwardedFor ?? readHeader(headers, "x-real-ip") ?? readHeader(headers, "cf-connecting-ip") ?? "anonymous";
}

function parseRequestBody(body: unknown): BodyParseResult {
  if (typeof body !== "string") {
    return { valid: true, value: body };
  }

  if (body.length > REQUEST_BODY_LIMIT) {
    return invalidRequest(413, "Request body is too large.", "REQUEST_TOO_LARGE");
  }

  try {
    return { valid: true, value: JSON.parse(body) as unknown };
  } catch {
    return invalidRequest(400, "Request body must be valid JSON.", "INVALID_JSON");
  }
}

function hasJsonContentType(headers: AssistantApiRequest["headers"]): boolean {
  const header = readHeader(headers, "content-type");
  const mediaType = header?.split(";", 1)[0]?.trim().toLowerCase();
  return mediaType === "application/json";
}

function readHeader(headers: AssistantApiRequest["headers"], headerName: string): string | undefined {
  const entry = Object.entries(headers).find(([name]) => name.toLowerCase() === headerName);
  const value = entry?.[1];
  return Array.isArray(value) ? value[0] : value;
}

function firstForwardedAddress(header: string | undefined): string | undefined {
  const address = header?.split(",", 1)[0]?.trim();
  return address === "" ? undefined : address;
}

function setResponseHeaders(
  setHeader: (name: string, value: string) => void,
  headers: Record<string, string> | undefined
): void {
  for (const [name, value] of Object.entries(headers ?? {})) {
    setHeader(name, value);
  }
}

function invalidRequest(
  statusCode: number,
  error: string,
  code: AssistantApiErrorCode
): { valid: false; issue: AssistantHttpError } {
  return { valid: false, issue: { statusCode, error, code } };
}
