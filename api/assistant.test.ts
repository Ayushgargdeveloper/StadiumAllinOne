import { afterEach, describe, expect, it, vi } from "vitest";
import defaultHandler, { assistantHandler, type AssistantApiRequest, type AssistantApiResponse } from "./assistant";

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
    await assistantHandler({ method: "GET", headers: {} }, response);
    expect(response.captured).toMatchObject({ statusCode: 405, body: { error: "Method not allowed." } });
  });

  it("rejects non-JSON content types", async () => {
    const response = createResponse();
    await assistantHandler({ method: "POST", headers: { "content-type": "text/plain" }, body: "{}" }, response);
    expect(response.captured).toMatchObject({ statusCode: 415 });
  });

  it("accepts uppercase content-type header arrays", async () => {
    const response = createResponse();
    await assistantHandler({ method: "POST", headers: { "Content-Type": ["application/json"] }, body: { question: "Gate route", language: "en" } }, response, {
      geminiApiKey: undefined
    });
    expect(response.captured).toMatchObject({ statusCode: 200 });
  });

  it("rejects invalid JSON strings", async () => {
    const response = createResponse();
    await assistantHandler({ method: "POST", headers: { "content-type": "application/json" }, body: "{" }, response);
    expect(response.captured).toMatchObject({ statusCode: 400 });
  });

  it("rejects oversized request bodies", async () => {
    const response = createResponse();
    await assistantHandler(postRequest("x".repeat(2_049)), response);
    expect(response.captured).toMatchObject({ statusCode: 413 });
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
    await assistantHandler(postRequest({ question: "Where is Gate B?", language: "en" }), response, {
      geminiApiKey: undefined
    });
    expect(response.captured.statusCode).toBe(200);
    expect(response.captured.body).toMatchObject({ sourceMode: "offline-fallback", intent: "navigation" });
  });

  it("returns validated Gemini structured output", async () => {
    const response = createResponse();
    await assistantHandler(postRequest({ question: "Where is Gate B?", language: "en" }), response, {
      geminiApiKey: "secret",
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
  });

  it("falls back when Gemini fails, times out, or returns invalid JSON", async () => {
    const failures = [
      { ok: false as const, reason: "api-error" as const },
      { ok: false as const, reason: "timeout" as const },
      { ok: true as const, text: "{invalid" }
    ];

    for (const failure of failures) {
      const response = createResponse();
      await assistantHandler(postRequest({ question: "Where is medical first aid help?", language: "en" }), response, {
        geminiApiKey: "secret",
        requestGemini: async () => failure
      });
      expect(response.captured.body).toMatchObject({ sourceMode: "offline-fallback", intent: "medical" });
    }
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
