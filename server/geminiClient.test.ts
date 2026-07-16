import { afterEach, describe, expect, it, vi } from "vitest";
import { requestGeminiResponse } from "./geminiClient";

describe("requestGeminiResponse", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns text from a valid Gemini response", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "{\"answer\":\"ok\"}" }] } }]
      })
    } satisfies Partial<Response>);

    await expect(requestGeminiResponse("secret", "prompt", fetcher)).resolves.toEqual({
      ok: true,
      text: "{\"answer\":\"ok\"}"
    });
    expect(String(fetcher.mock.calls[0]?.[0])).toContain("key=secret");
  });

  it("returns api-error for non-ok provider responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    } satisfies Partial<Response>);

    await expect(requestGeminiResponse("secret", "prompt", fetcher)).resolves.toEqual({
      ok: false,
      reason: "api-error"
    });
  });

  it("returns invalid-response for missing candidate text", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [] })
    } satisfies Partial<Response>);

    await expect(requestGeminiResponse("secret", "prompt", fetcher)).resolves.toEqual({
      ok: false,
      reason: "invalid-response"
    });
  });

  it("returns timeout when the provider request is aborted", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Timeout", "AbortError")));
    }));

    const result = requestGeminiResponse("secret", "prompt", fetcher);
    await vi.advanceTimersByTimeAsync(8_000);

    await expect(result).resolves.toEqual({ ok: false, reason: "timeout" });
  });

  it("returns api-error for non-timeout fetch failures", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("network"));

    await expect(requestGeminiResponse("secret", "prompt", fetcher)).resolves.toEqual({
      ok: false,
      reason: "api-error"
    });
  });
});
