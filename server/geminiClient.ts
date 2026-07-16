const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_TIMEOUT_MS = 8_000;

export type GeminiClientResult =
  | { ok: true; text: string }
  | { ok: false; reason: "api-error" | "timeout" | "invalid-response" };

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export async function requestGeminiResponse(
  apiKey: string,
  prompt: string,
  fetcher: typeof fetch = fetch
): Promise<GeminiClientResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetcher(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      return { ok: false, reason: "api-error" };
    }

    const payload = await response.json() as GeminiGenerateContentResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim().length > 0
      ? { ok: true, text }
      : { ok: false, reason: "invalid-response" };
  } catch (error) {
    return isAbortError(error) ? { ok: false, reason: "timeout" } : { ok: false, reason: "api-error" };
  } finally {
    clearTimeout(timeoutId);
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
