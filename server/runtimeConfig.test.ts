import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeGeminiApiKey, readGeminiApiKey, readGeminiModel } from "./runtimeConfig";

describe("runtimeConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes configured API keys", () => {
    vi.stubEnv("GEMINI_API_KEY", "  server-secret  ");
    expect(readGeminiApiKey()).toBe("server-secret");
    expect(normalizeGeminiApiKey("   ")).toBeUndefined();
  });

  it("uses the current stable model by default", () => {
    vi.stubEnv("GEMINI_MODEL", "");
    expect(readGeminiModel()).toBe("gemini-3.5-flash");
  });

  it("accepts safe model overrides and rejects malformed values", () => {
    vi.stubEnv("GEMINI_MODEL", " gemini-2.5-flash ");
    expect(readGeminiModel()).toBe("gemini-2.5-flash");

    vi.stubEnv("GEMINI_MODEL", "../../untrusted-model");
    expect(readGeminiModel()).toBe("gemini-3.5-flash");
  });
});
