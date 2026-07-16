export type AssistantApiErrorCode =
  | "METHOD_NOT_ALLOWED"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "INVALID_JSON"
  | "REQUEST_TOO_LARGE"
  | "INVALID_REQUEST"
  | "RATE_LIMITED";

export type AssistantApiErrorPayload = {
  error: string;
  code: AssistantApiErrorCode;
  requestId: string;
};

export function createAssistantApiErrorPayload(
  error: string,
  code: AssistantApiErrorCode,
  requestId: string
): AssistantApiErrorPayload {
  return { error, code, requestId };
}
