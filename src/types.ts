export const supportedLanguages = ["en", "es", "fr"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const assistantIntents = [
  "navigation",
  "crowd",
  "accessibility",
  "transportation",
  "medical",
  "sustainability",
  "staff"
] as const;
export type AssistantIntent = (typeof assistantIntents)[number];

export type AssistantResult =
  | {
      status: "success";
      language: SupportedLanguage;
      intent: AssistantIntent;
      response: string;
    }
  | {
      status: "error";
      language: SupportedLanguage;
      reason: "empty" | "too-long" | "unknown-intent";
      response: string;
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
