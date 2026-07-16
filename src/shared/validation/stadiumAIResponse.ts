import {
  assistantResponseIntents,
  sourceModes,
  targetUsers,
  urgencyLevels,
  type SourceMode,
  type StadiumAIResponse
} from "../contracts/stadium";

export function validateStadiumAIResponse(value: unknown, sourceModeOverride?: SourceMode): StadiumAIResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  const answer = readNonEmptyString(value.answer);
  const intent = readEnum(value.intent, assistantResponseIntents);
  const recommendedAction = readNonEmptyString(value.recommendedAction);
  const urgency = readEnum(value.urgency, urgencyLevels);
  const targetUser = readEnum(value.targetUser, targetUsers);
  const sourceMode = sourceModeOverride ?? readEnum(value.sourceMode, sourceModes);
  const alternativeLocation = value.alternativeLocation === undefined
    ? undefined
    : readOptionalString(value.alternativeLocation);

  if (
    answer === null ||
    intent === null ||
    recommendedAction === null ||
    urgency === null ||
    targetUser === null ||
    sourceMode === null ||
    alternativeLocation === null
  ) {
    return null;
  }

  const response: StadiumAIResponse = {
    answer,
    intent,
    recommendedAction,
    urgency,
    targetUser,
    sourceMode
  };

  if (alternativeLocation !== undefined) {
    response.alternativeLocation = alternativeLocation;
  }

  return response;
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
