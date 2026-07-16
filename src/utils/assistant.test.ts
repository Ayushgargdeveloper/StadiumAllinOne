import { describe, expect, it } from "vitest";
import { MAX_ASSISTANT_INPUT_LENGTH } from "../constants";
import { assistantIntents } from "../types";
import {
  detectIntent,
  generateAssistantResponse,
  generateOfflineAssistantResponse,
  sanitizeAssistantInput,
  validateLanguage
} from "./assistant";

const intentPrompts = {
  navigation: "Which gate route gets me to section 120?",
  crowd: "How busy is the crowd and queue?",
  accessibility: "Where is the accessible wheelchair entrance?",
  transportation: "Which transport exit connects to rail?",
  medical: "Where is medical first aid help?",
  sustainability: "Where can I refill water and recycle waste?",
  operations: "What should a volunteer staff member do?"
} as const;

describe("assistant utilities", () => {
  it("sanitizes control characters and trims input", () => {
    expect(sanitizeAssistantInput(" \u0000Gate A\u001F route\u007F ")).toBe("Gate A route");
  });

  it("rejects empty input with a structured fallback response", () => {
    const result = generateAssistantResponse("", "en");
    expect(result).toMatchObject({ status: "error", reason: "empty" });
    expect(result.structuredResponse).toMatchObject({ intent: "unknown", sourceMode: "offline-fallback" });
  });

  it("rejects whitespace-only input", () => {
    const result = generateAssistantResponse("     ", "en");
    expect(result).toMatchObject({ status: "error", reason: "empty" });
  });

  it("accepts valid maximum-length input", () => {
    const result = generateAssistantResponse(`gate ${"a".repeat(MAX_ASSISTANT_INPUT_LENGTH - 5)}`, "en");
    expect(result.status).toBe("success");
  });

  it("rejects over-limit input safely", () => {
    const result = generateAssistantResponse(`gate ${"a".repeat(MAX_ASSISTANT_INPUT_LENGTH)}`, "en");
    expect(result).toMatchObject({ status: "error", reason: "too-long" });
  });

  it("removes control characters before intent detection", () => {
    const result = generateAssistantResponse("\u0000medical\u001F desk", "en");
    expect(result).toMatchObject({ status: "success", intent: "medical" });
  });

  it("validates supported languages", () => {
    expect(validateLanguage("fr")).toBe("fr");
  });

  it("falls back for unsupported languages", () => {
    expect(validateLanguage("de")).toBe("en");
    expect(generateAssistantResponse("gate route", "de").language).toBe("en");
  });

  it.each(assistantIntents)("detects %s intent", (intent) => {
    expect(detectIntent(intentPrompts[intent])).toBe(intent);
  });

  it("returns fallback for unknown intent", () => {
    const result = generateAssistantResponse("I want a souvenir scarf", "en");
    expect(result).toMatchObject({ status: "error", reason: "unknown-intent" });
    expect(result.structuredResponse.recommendedAction).toContain("Ask a stadium operations question");
  });

  it("generates multilingual responses", () => {
    expect(generateAssistantResponse("gate route", "en").response).toContain("Navigation recommendation");
    expect(generateAssistantResponse("gate route", "es").response).toContain("Recomendacion de navegacion");
    expect(generateAssistantResponse("gate route", "fr").response).toContain("Recommandation de navigation");
  });

  it("generates a typed offline fallback response", () => {
    expect(generateOfflineAssistantResponse("crowd queue", "en")).toMatchObject({
      intent: "crowd",
      urgency: "high",
      targetUser: "staff",
      sourceMode: "offline-fallback"
    });
  });
});
