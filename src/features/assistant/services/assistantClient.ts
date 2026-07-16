import { type AssistantApiRequestBody, type StadiumAIResponse, type SupportedLanguage } from "../../../shared/contracts/stadium";
import { validateStadiumAIResponse } from "../../../shared/validation/stadiumAIResponse";

export class AssistantClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssistantClientError";
  }
}

export async function requestAssistantResponse(
  question: string,
  language: SupportedLanguage,
  fetcher: typeof fetch = fetch
): Promise<StadiumAIResponse> {
  const body: AssistantApiRequestBody = { question, language };
  const response = await fetcher("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = await response.json() as unknown;
  if (!response.ok) {
    throw new AssistantClientError(readErrorMessage(payload));
  }

  const validatedPayload = validateStadiumAIResponse(payload);
  if (validatedPayload === null) {
    throw new AssistantClientError("Assistant returned an invalid response.");
  }

  return validatedPayload;
}

function readErrorMessage(payload: unknown): string {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const error = payload.error;
    return typeof error === "string" ? error : "Assistant request failed.";
  }

  return "Assistant request failed.";
}
