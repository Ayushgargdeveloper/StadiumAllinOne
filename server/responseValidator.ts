export { validateStadiumAIResponse } from "../src/shared/validation/stadiumAIResponse";

export function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("```") ? stripJsonFence(trimmed) : trimmed;
  return JSON.parse(jsonText);
}

function stripJsonFence(text: string): string {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}
