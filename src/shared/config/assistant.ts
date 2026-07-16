import { supportedLanguages, type SupportedLanguage } from "../contracts/stadium";

export const MAX_ASSISTANT_INPUT_LENGTH = 220;
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Spanish",
  fr: "French"
};

export const SUPPORTED_LANGUAGE_OPTIONS = supportedLanguages;
