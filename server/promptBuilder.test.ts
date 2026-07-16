import { describe, expect, it } from "vitest";
import { buildAssistantPrompt } from "./promptBuilder";

describe("buildAssistantPrompt", () => {
  it("includes FIFA World Cup 2026 context, stadium data, and JSON-only constraints", () => {
    const prompt = buildAssistantPrompt("Where should wheelchair users enter?", "en");

    expect(prompt).toContain("FIFA World Cup 2026 stadium operations assistant");
    expect(prompt).toContain("Use only the supplied stadium context");
    expect(prompt).toContain("Return JSON only");
    expect(prompt).toContain("Accessible Entrance E");
    expect(prompt).toContain("Where should wheelchair users enter?");
  });
});
