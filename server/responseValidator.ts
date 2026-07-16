import {
  assistantResponseIntents,
  sourceModes,
  targetUsers,
  urgencyLevels,
  type AssistantResponseIntent,
  type SourceMode,
  type StadiumAIResponse,
  type TargetUser,
  type UrgencyLevel
} from "../src/types";

export function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("```") ? stripJsonFence(trimmed) : trimmed;
  return JSON.parse(jsonText);
}

export function validateStadiumAIResponse(value: unknown, sourceMode: SourceMode): StadiumAIResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  const answer = readNonEmptyString(value.answer);
  const intent = readEnum(value.intent, assistantResponseIntents);
  const recommendedAction = readNonEmptyString(value.recommendedAction);
  const urgency = readEnum(value.urgency, urgencyLevels);
  const targetUser = readEnum(value.targetUser, targetUsers);
  const alternativeLocation = value.alternativeLocation === undefined
    ? undefined
    : readOptionalString(value.alternativeLocation);

  if (
    answer === null ||
    intent === null ||
    recommendedAction === null ||
    urgency === null ||
    targetUser === null ||
    alternativeLocation === null ||
    !sourceModes.includes(sourceMode)
  ) {
    return null;
  }

  return {
    answer,
    intent,
    recommendedAction,
    alternativeLocation,
    urgency,
    targetUser,
    sourceMode
  };
}

function stripJsonFence(text: string): string {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

function readNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readOptionalString(value: unknown): string | null | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readEnum<TValue extends string>(value: unknown, options: readonly TValue[]): TValue | null {
  return typeof value === "string" && options.includes(value as TValue) ? (value as TValue) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type ValidatedGeminiResponse = StadiumAIResponse & {
  intent: AssistantResponseIntent;
  urgency: UrgencyLevel;
  targetUser: TargetUser;
};
