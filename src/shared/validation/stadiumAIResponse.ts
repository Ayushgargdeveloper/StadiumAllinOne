import {
  assistantResponseIntents,
  sourceModes,
  targetUsers,
  urgencyLevels,
  type SourceMode,
  type StadiumAIResponse
} from "../contracts/stadium";

type ParsedResponseFields = {
  answer: string | null;
  intent: StadiumAIResponse["intent"] | null;
  recommendedAction: string | null;
  urgency: StadiumAIResponse["urgency"] | null;
  targetUser: StadiumAIResponse["targetUser"] | null;
  sourceMode: SourceMode | null;
  alternativeLocation: string | null | undefined;
};

type ValidResponseFields = {
  [Field in keyof ParsedResponseFields]: Exclude<ParsedResponseFields[Field], null>;
};

export function validateStadiumAIResponse(value: unknown, sourceModeOverride?: SourceMode): StadiumAIResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  const fields: ParsedResponseFields = {
    answer: readNonEmptyString(value.answer),
    intent: readEnum(value.intent, assistantResponseIntents),
    recommendedAction: readNonEmptyString(value.recommendedAction),
    urgency: readEnum(value.urgency, urgencyLevels),
    targetUser: readEnum(value.targetUser, targetUsers),
    sourceMode: sourceModeOverride ?? readEnum(value.sourceMode, sourceModes),
    alternativeLocation:
      value.alternativeLocation === undefined ? undefined : readOptionalString(value.alternativeLocation)
  };

  if (!hasValidFields(fields)) {
    return null;
  }

  const response: StadiumAIResponse = {
    answer: fields.answer,
    intent: fields.intent,
    recommendedAction: fields.recommendedAction,
    urgency: fields.urgency,
    targetUser: fields.targetUser,
    sourceMode: fields.sourceMode
  };

  if (fields.alternativeLocation !== undefined) {
    response.alternativeLocation = fields.alternativeLocation;
  }

  return response;
}

function hasValidFields(fields: ParsedResponseFields): fields is ValidResponseFields {
  return Object.values(fields).every((field) => field !== null);
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
