import { afterEach, describe, expect, it, vi } from "vitest";
import defaultHandler, { assistantHandler, type AssistantApiRequest, type AssistantApiResponse } from "./assistant";
import { MAX_ASSISTANT_INPUT_LENGTH } from "../src/shared/config/assistant";

type CapturedResponse = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
};

function createResponse(): AssistantApiResponse & { captured: CapturedResponse } {
  const captured: CapturedResponse = { statusCode: 200, body: undefined, headers: {} };
  return {
    captured,
    status(statusCode: number) {
      captured.statusCode = statusCode;
      return this;
    },
    json(body: unknown) {
      captured.body = body;
    },
    setHeader(name: string, value: string) {
      captured.headers[name] = value;
    }
  };
}

function postRequest(body: unknown): AssistantApiRequest {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body
  };
}

describe("assistantHandler", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the default exported handler and environment-key fallback path", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const response = createResponse();
    await defaultHandler(postRequest({ question: "Where is Gate B?", language: "en" }), response);
    expect(response.captured.body).toMatchObject({ sourceMode: "offline-fallback", intent: "navigation" });
  });

  it("rejects non-POST requests", async () => {
    const response = createResponse();
    await assistantHandler({ method: "GET", headers: {} }, response, {
      createRequestId: () => "req-method"
    });
    expect(response.captured).toMatchObject({
      statusCode: 405,
      body: { error: "Method not allowed.", code: "METHOD_NOT_ALLOWED", requestId: "req-method" }
    });
    expect(response.captured.headers["X-Request-Id"]).toBe("req-method");
  });

  it("rejects non-JSON content types", async () => {
    const response = createResponse();
    await assistantHandler({ method: "POST", headers: { "content-type": "text/plain" }, body: "{}" }, response);
    expect(response.captured).toMatchObject({ statusCode: 415 });
  });

  it("accepts uppercase content-type header arrays", async () => {
    const response = createResponse();
    await assistantHandler({ method: "POST", headers: { "Content-Type": ["Application/JSON; charset=utf-8"] }, body: { question: "Gate route", language: "en" } }, response, {
      geminiApiKey: undefined
    });
    expect(response.captured).toMatchObject({ statusCode: 200 });
  });

  it("rejects content types that only contain the JSON media type as a substring", async () => {
    const response = createResponse();
    await assistantHandler({ method: "POST", headers: { "content-type": "application/jsonp" }, body: "{}" }, response);
    expect(response.captured).toMatchObject({ statusCode: 415 });
  });

  it("rejects invalid JSON strings", async () => {
    const response = createResponse();
    await assistantHandler({ method: "POST", headers: { "content-type": "application/json" }, body: "{" }, response, {
      createRequestId: () => "req-invalid-json"
    });
    expect(response.captured).toMatchObject({
      statusCode: 400,
      body: { code: "INVALID_JSON", requestId: "req-invalid-json" }
    });
  });

  it("rejects oversized request bodies", async () => {
    const response = createResponse();
    await assistantHandler(postRequest("x".repeat(2_049)), response, {
      createRequestId: () => "req-too-large"
    });
    expect(response.captured).toMatchObject({
      statusCode: 413,
      body: { code: "REQUEST_TOO_LARGE", requestId: "req-too-large" }
    });
  });

  it("rejects oversized validated questions with a typed request-too-large error", async () => {
    const response = createResponse();
    await assistantHandler(postRequest({ question: "x".repeat(MAX_ASSISTANT_INPUT_LENGTH + 1), language: "en" }), response, {
      createRequestId: () => "req-question-too-large"
    });
    expect(response.captured).toMatchObject({
      statusCode: 413,
      body: { code: "REQUEST_TOO_LARGE", requestId: "req-question-too-large" }
    });
  });

  it("rejects invalid request fields before calling Gemini", async () => {
    const response = createResponse();
    const requestGemini = vi.fn();
    await assistantHandler(postRequest({ question: "", language: "en" }), response, {
      geminiApiKey: "secret",
      requestGemini
    });
    expect(response.captured).toMatchObject({ statusCode: 400 });
    expect(requestGemini).not.toHaveBeenCalled();
  });

  it("uses offline fallback when the API key is missing", async () => {
    const response = createResponse();
    const recordFallback = vi.fn();
    await assistantHandler(postRequest({ question: "Where is Gate B?", language: "en" }), response, {
      geminiApiKey: undefined,
      createRequestId: () => "req-fallback",
      recordFallback
    });
    expect(response.captured.statusCode).toBe(200);
    expect(response.captured.body).toMatchObject({ sourceMode: "offline-fallback", intent: "navigation" });
    expect(recordFallback).toHaveBeenCalledWith({ requestId: "req-fallback", reason: "missing-api-key" });
  });

  it("does not fail the request when fallback observation throws", async () => {
    const response = createResponse();
    await assistantHandler(postRequest({ question: "Where is Gate B?", language: "en" }), response, {
      geminiApiKey: undefined,
      recordFallback: () => {
        throw new Error("telemetry unavailable");
      }
    });

    expect(response.captured.body).toMatchObject({ sourceMode: "offline-fallback", intent: "navigation" });
  });

  it("returns validated Gemini structured output", async () => {
    const response = createResponse();
    const recordFallback = vi.fn();
    await assistantHandler(postRequest({ question: "Where is Gate B?", language: "en" }), response, {
      geminiApiKey: "secret",
      recordFallback,
      requestGemini: async () => ({
        ok: true,
        text: JSON.stringify({
          answer: "Use Gate B and follow north concourse signs.",
          intent: "navigation",
          recommendedAction: "Direct the fan to Gate B.",
          alternativeLocation: "Gate B",
          urgency: "low",
          targetUser: "fan"
        })
      })
    });
    expect(response.captured.body).toMatchObject({ sourceMode: "gemini", intent: "navigation" });
    expect(recordFallback).not.toHaveBeenCalled();
  });

  it("reads the Gemini API key from the environment when no override is provided", async () => {
    vi.stubEnv("GEMINI_API_KEY", "  secret-from-env  ");
    const response = createResponse();
    const requestGemini = vi.fn(async () => ({
      ok: true as const,
      text: JSON.stringify({
        answer: "Use Gate B and follow north concourse signs.",
        intent: "navigation",
        recommendedAction: "Direct the fan to Gate B.",
        urgency: "low",
        targetUser: "fan"
      })
    }));

    await assistantHandler(postRequest({ question: "Where is Gate B?", language: "en" }), response, {
      requestGemini
    });

    expect(requestGemini).toHaveBeenCalledWith("secret-from-env", expect.any(String));
    expect(response.captured.body).toMatchObject({ sourceMode: "gemini", intent: "navigation" });
  });

  it("falls back with safe reason classification when Gemini is unavailable or invalid", async () => {
    const failures = [
      { result: { ok: false as const, reason: "api-error" as const }, reason: "provider-api-error" },
      { result: { ok: false as const, reason: "timeout" as const }, reason: "provider-timeout" },
      { result: { ok: false as const, reason: "invalid-response" as const }, reason: "provider-invalid-response" },
      { result: { ok: true as const, text: "{invalid" }, reason: "model-invalid-json" },
      {
        result: {
          ok: true as const,
          text: JSON.stringify({ answer: "Missing required structured fields." })
        },
        reason: "model-invalid-schema"
      }
    ];

    for (const failure of failures) {
      const response = createResponse();
      const recordFallback = vi.fn();
      await assistantHandler(postRequest({ question: "Where is medical first aid help?", language: "en" }), response, {
        geminiApiKey: "secret",
        createRequestId: () => "req-provider-fallback",
        recordFallback,
        requestGemini: async () => failure.result
      });
      expect(response.captured.body).toMatchObject({ sourceMode: "offline-fallback", intent: "medical" });
      expect(recordFallback).toHaveBeenCalledWith({
        requestId: "req-provider-fallback",
        reason: failure.reason
      });
    }
  });

  it("rate limits POST requests before provider work", async () => {
    const response = createResponse();
    const requestGemini = vi.fn();

    await assistantHandler(postRequest({ question: "Where is Gate B?", language: "en" }), response, {
      geminiApiKey: "secret",
      createRequestId: () => "req-rate-limited",
      checkRateLimit: () => ({ allowed: false, retryAfterSeconds: 30 }),
      requestGemini
    });

    expect(response.captured).toMatchObject({
      statusCode: 429,
      body: {
        error: "Too many assistant requests. Please retry shortly.",
        code: "RATE_LIMITED",
        requestId: "req-rate-limited"
      }
    });
    expect(response.captured.headers["Retry-After"]).toBe("30");
    expect(requestGemini).not.toHaveBeenCalled();
  });

  it("uses forwarded client identifiers for rate limiting", async () => {
    const response = createResponse();
    const checkRateLimit = vi.fn(() => ({ allowed: true as const }));

    await assistantHandler({
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.5, 198.51.100.1"
      },
      body: { question: "Gate route", language: "en" }
    }, response, {
      geminiApiKey: undefined,
      checkRateLimit
    });

    expect(checkRateLimit).toHaveBeenCalledWith("203.0.113.5");
  });

  it("sets no-store cache headers", async () => {
    const response = createResponse();
    await assistantHandler(postRequest({ question: "Where is Gate B?", language: "en" }), response, {
      geminiApiKey: undefined
    });
    expect(response.captured.headers["Cache-Control"]).toBe("no-store");
  });

  it("works with response objects that do not support setHeader", async () => {
    const captured: CapturedResponse = { statusCode: 200, body: undefined, headers: {} };
    const response: AssistantApiResponse = {
      status(statusCode: number) {
        captured.statusCode = statusCode;
        return this;
      },
      json(body: unknown) {
        captured.body = body;
      }
    };
    await assistantHandler(postRequest({ question: "Gate route", language: "en" }), response, {
      geminiApiKey: undefined
    });
    expect(captured.body).toMatchObject({ sourceMode: "offline-fallback" });
  });
});
