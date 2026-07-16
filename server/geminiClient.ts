import { readGeminiModel } from "./runtimeConfig";

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_TIMEOUT_MS = 8_000;

export type GeminiClientResult =
  { ok: true; text: string } | { ok: false; reason: "api-error" | "timeout" | "invalid-response" };

export async function requestGeminiResponse(
  apiKey: string,
  prompt: string,
  fetcher: typeof fetch = fetch
): Promise<GeminiClientResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    return await performGeminiRequest(apiKey, prompt, controller.signal, fetcher);
  } catch (error) {
    return isAbortError(error) ? { ok: false, reason: "timeout" } : { ok: false, reason: "api-error" };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function performGeminiRequest(
  apiKey: string,
  prompt: string,
  signal: AbortSignal,
  fetcher: typeof fetch
): Promise<GeminiClientResult> {
  const model = encodeURIComponent(readGeminiModel());
  const response = await fetcher(`${GEMINI_API_BASE_URL}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    signal,
    body: createRequestBody(prompt)
  });

  if (!response.ok) {
    return { ok: false, reason: "api-error" };
  }

  const text = readCandidateText(await response.json());
  return text === null ? { ok: false, reason: "invalid-response" } : { ok: true, text };
}

function createRequestBody(prompt: string): string {
  return JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  });
}

function readCandidateText(payload: unknown): string | null {
  const candidate = firstArrayItem(readProperty(payload, "candidates"));
  const content = readProperty(candidate, "content");
  const part = firstArrayItem(readProperty(content, "parts"));
  const text = readProperty(part, "text");
  return typeof text === "string" && text.trim().length > 0 ? text : null;
}

function readProperty(value: unknown, property: string): unknown {
  return isRecord(value) ? value[property] : undefined;
}

function firstArrayItem(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
