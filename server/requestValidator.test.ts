import { describe, expect, it } from "vitest";
import { MAX_ASSISTANT_INPUT_LENGTH } from "../src/constants";
import { validateAssistantRequestBody } from "./requestValidator";

describe("validateAssistantRequestBody", () => {
  it("rejects non-object bodies", () => {
    expect(validateAssistantRequestBody(null)).toMatchObject({ valid: false, statusCode: 400 });
  });

  it("rejects missing questions", () => {
    expect(validateAssistantRequestBody({ language: "en" })).toMatchObject({ valid: false, error: "Question is required." });
  });

  it("rejects empty questions", () => {
    expect(validateAssistantRequestBody({ question: "   ", language: "en" })).toMatchObject({ valid: false, error: "Question cannot be empty." });
  });

  it("rejects oversized questions", () => {
    expect(validateAssistantRequestBody({ question: "a".repeat(MAX_ASSISTANT_INPUT_LENGTH + 1), language: "en" })).toMatchObject({
      valid: false,
      statusCode: 413
    });
  });

  it("rejects unsupported languages", () => {
    expect(validateAssistantRequestBody({ question: "Gate route", language: "de" })).toMatchObject({
      valid: false,
      error: "Language is not supported."
    });
  });

  it("returns sanitized valid requests", () => {
    expect(validateAssistantRequestBody({ question: "\u0000 Gate route ", language: "en" })).toEqual({
      valid: true,
      value: { question: "Gate route", language: "en" }
    });
  });
});
