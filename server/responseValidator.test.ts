import { describe, expect, it } from "vitest";
import { parseGeminiJson, validateStadiumAIResponse } from "./responseValidator";

const validProviderPayload = {
  answer: "Use Gate B and follow north concourse signs.",
  intent: "navigation",
  recommendedAction: "Direct the fan to Gate B.",
  alternativeLocation: "Gate B",
  urgency: "low",
  targetUser: "fan"
};

describe("responseValidator", () => {
  it("parses plain JSON and fenced JSON", () => {
    expect(parseGeminiJson(JSON.stringify(validProviderPayload))).toEqual(validProviderPayload);
    expect(parseGeminiJson(`\`\`\`json\n${JSON.stringify(validProviderPayload)}\n\`\`\``)).toEqual(validProviderPayload);
  });

  it("validates structured model output and stamps source mode", () => {
    expect(validateStadiumAIResponse(validProviderPayload, "gemini")).toEqual({
      ...validProviderPayload,
      sourceMode: "gemini"
    });
  });

  it("accepts valid output without an alternative location", () => {
    const withoutAlternativeLocation: Record<string, unknown> = { ...validProviderPayload };
    delete withoutAlternativeLocation.alternativeLocation;
    expect(validateStadiumAIResponse(withoutAlternativeLocation, "gemini")).toEqual({
      ...withoutAlternativeLocation,
      sourceMode: "gemini"
    });
  });

  it("rejects invalid model output", () => {
    expect(validateStadiumAIResponse({ ...validProviderPayload, urgency: "urgent" }, "gemini")).toBeNull();
    expect(validateStadiumAIResponse({ ...validProviderPayload, answer: "" }, "gemini")).toBeNull();
    expect(validateStadiumAIResponse("not an object", "gemini")).toBeNull();
  });

  it("rejects empty optional alternative locations", () => {
    expect(validateStadiumAIResponse({ ...validProviderPayload, alternativeLocation: "" }, "gemini")).toBeNull();
  });
});
