import { describe, expect, it, vi } from "vitest";
import { requestAssistantResponse, AssistantClientError } from "./assistantClient";
import { type StadiumAIResponse } from "../types";

const aiResponse: StadiumAIResponse = {
  answer: "Go to Gate B.",
  intent: "navigation",
  recommendedAction: "Use the north concourse signs.",
  alternativeLocation: "Gate B",
  urgency: "low",
  targetUser: "fan",
  sourceMode: "gemini"
};

describe("assistantClient", () => {
  it("posts to the secure assistant endpoint", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => aiResponse
    } satisfies Partial<Response>);

    await expect(requestAssistantResponse("Where is Gate B?", "en", fetcher)).resolves.toEqual(aiResponse);
    expect(fetcher).toHaveBeenCalledWith("/api/assistant", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Where is Gate B?", language: "en" })
    }));
  });

  it("throws a safe client error when the endpoint rejects the request", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Question cannot be empty." })
    } satisfies Partial<Response>);

    await expect(requestAssistantResponse("", "en", fetcher)).rejects.toThrow(AssistantClientError);
  });

  it("uses a generic error when the endpoint payload is malformed", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 123 })
    } satisfies Partial<Response>);

    await expect(requestAssistantResponse("", "en", fetcher)).rejects.toThrow("Assistant request failed.");
  });

  it("uses a generic error when the endpoint returns no error object", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => "failed"
    } satisfies Partial<Response>);

    await expect(requestAssistantResponse("", "en", fetcher)).rejects.toThrow("Assistant request failed.");
  });
});
