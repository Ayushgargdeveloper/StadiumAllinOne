export const supportedLanguages = ["en", "es", "fr"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const assistantIntents = [
  "navigation",
  "crowd",
  "accessibility",
  "transportation",
  "medical",
  "sustainability",
  "operations"
] as const;
export type AssistantIntent = (typeof assistantIntents)[number];

export const assistantResponseIntents = [...assistantIntents, "unknown"] as const;
export type AssistantResponseIntent = (typeof assistantResponseIntents)[number];

export const urgencyLevels = ["low", "medium", "high", "critical"] as const;
export type UrgencyLevel = (typeof urgencyLevels)[number];

export const targetUsers = ["fan", "volunteer", "staff", "organizer"] as const;
export type TargetUser = (typeof targetUsers)[number];

export const sourceModes = ["gemini", "offline-fallback"] as const;
export type SourceMode = (typeof sourceModes)[number];

export type StadiumAIResponse = {
  answer: string;
  intent: AssistantResponseIntent;
  recommendedAction: string;
  alternativeLocation?: string;
  urgency: UrgencyLevel;
  targetUser: TargetUser;
  sourceMode: SourceMode;
};

export type AssistantApiRequestBody = {
  question: string;
  language: SupportedLanguage;
};

export type AssistantResult =
  | {
      status: "success";
      language: SupportedLanguage;
      intent: AssistantIntent;
      response: string;
      structuredResponse: StadiumAIResponse;
    }
  | {
      status: "error";
      language: SupportedLanguage;
      reason: "empty" | "too-long" | "unknown-intent";
      response: string;
      structuredResponse: StadiumAIResponse;
    };

export type CrowdStatus = "Low" | "Moderate" | "High" | "Critical";
export type WaitingTimeCategory = "Short" | "Medium" | "Long" | "Severe";
export type AlertSeverity = "Advisory" | "Elevated" | "Urgent";

export type StadiumContext = Record<AssistantIntent, string>;

export type CrowdLocation = {
  id: string;
  name: string;
  crowdStatus: CrowdStatus;
  waitingTimeCategory: WaitingTimeCategory;
  recommendedAlternative: string;
  recommendedAction: string;
};

export type OperationsAlert = {
  id: string;
  title: string;
  severity: AlertSeverity;
  location: string;
  responsibleTeam: string;
  recommendedResponse: string;
};

export type InclusiveSupportGroup = {
  title: "Accessibility" | "Transportation" | "Sustainability";
  items: readonly string[];
};
