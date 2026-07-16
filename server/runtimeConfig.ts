const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_MODEL_PATTERN = /^[a-z0-9][a-z0-9.-]{0,79}$/;

export function readGeminiApiKey(): string | undefined {
  return normalizeGeminiApiKey(readEnvironmentVariable("GEMINI_API_KEY"));
}

export function normalizeGeminiApiKey(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue === "" ? undefined : normalizedValue;
}

export function readGeminiModel(): string {
  const configuredModel = readEnvironmentVariable("GEMINI_MODEL")?.trim();
  return configuredModel !== undefined && GEMINI_MODEL_PATTERN.test(configuredModel)
    ? configuredModel
    : DEFAULT_GEMINI_MODEL;
}

function readEnvironmentVariable(name: string): string | undefined {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[name];
}
