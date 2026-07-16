import { DEFAULT_LANGUAGE, MAX_ASSISTANT_INPUT_LENGTH } from "../constants";
import { stadiumContext } from "../data/stadiumData";
import {
  assistantIntents,
  supportedLanguages,
  type AssistantIntent,
  type AssistantResult,
  type SupportedLanguage
} from "../types";

const intentKeywords: Record<AssistantIntent, readonly string[]> = {
  navigation: ["gate", "seat", "section", "route", "navigate", "navigation", "where", "entrada", "porte"],
  crowd: ["crowd", "busy", "line", "queue", "wait", "congestion", "fila", "foule"],
  accessibility: ["accessible", "wheelchair", "restroom", "quiet", "sensory", "accessibility", "accesible"],
  transportation: ["transport", "train", "rail", "shuttle", "exit", "bus", "metro", "transporte"],
  medical: ["medical", "first aid", "doctor", "injury", "help", "médico", "medicale"],
  sustainability: ["water", "refill", "recycle", "waste", "sustainability", "green", "agua", "eau"],
  staff: ["staff", "volunteer", "organizer", "operations", "team", "voluntario", "benevole"]
};

const templates: Record<SupportedLanguage, Record<AssistantIntent, string>> = {
  en: {
    navigation: "Navigation recommendation: {context}",
    crowd: "Crowd recommendation: {context}",
    accessibility: "Accessibility recommendation: {context}",
    transportation: "Transportation recommendation: {context}",
    medical: "Medical assistance recommendation: {context}",
    sustainability: "Sustainability recommendation: {context}",
    staff: "Staff support recommendation: {context}"
  },
  es: {
    navigation: "Recomendación de navegación: {context}",
    crowd: "Recomendación de aforo: {context}",
    accessibility: "Recomendación de accesibilidad: {context}",
    transportation: "Recomendación de transporte: {context}",
    medical: "Recomendación de asistencia médica: {context}",
    sustainability: "Recomendación de sostenibilidad: {context}",
    staff: "Recomendación para personal y voluntarios: {context}"
  },
  fr: {
    navigation: "Recommandation de navigation : {context}",
    crowd: "Recommandation de gestion de foule : {context}",
    accessibility: "Recommandation d'accessibilité : {context}",
    transportation: "Recommandation de transport : {context}",
    medical: "Recommandation d'assistance médicale : {context}",
    sustainability: "Recommandation de durabilité : {context}",
    staff: "Recommandation pour le personnel et les bénévoles : {context}"
  }
};

const fallbackResponses: Record<SupportedLanguage, Record<"empty" | "too-long" | "unknown-intent", string>> = {
  en: {
    empty: "Please enter a stadium question so StadiumPulse AI can help.",
    "too-long": `Please keep the request within ${MAX_ASSISTANT_INPUT_LENGTH} characters.`,
    "unknown-intent": "StadiumPulse AI can help with navigation, crowd level, accessibility, transportation, medical assistance, sustainability, or staff assistance."
  },
  es: {
    empty: "Escribe una pregunta del estadio para que StadiumPulse AI pueda ayudar.",
    "too-long": `Mantén la solicitud dentro de ${MAX_ASSISTANT_INPUT_LENGTH} caracteres.`,
    "unknown-intent": "StadiumPulse AI ayuda con navegación, aforo, accesibilidad, transporte, asistencia médica, sostenibilidad o apoyo al personal."
  },
  fr: {
    empty: "Saisissez une question sur le stade afin que StadiumPulse AI puisse aider.",
    "too-long": `Veuillez limiter la demande à ${MAX_ASSISTANT_INPUT_LENGTH} caractères.`,
    "unknown-intent": "StadiumPulse AI aide pour la navigation, la foule, l'accessibilité, le transport, l'assistance médicale, la durabilité ou le personnel."
  }
};

export function sanitizeAssistantInput(input: string): string {
  return [...input].filter((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint !== undefined && (codePoint > 31 && codePoint !== 127);
  }).join("").trim();
}

export function validateLanguage(language: string): SupportedLanguage {
  return supportedLanguages.includes(language as SupportedLanguage) ? (language as SupportedLanguage) : DEFAULT_LANGUAGE;
}

export function detectIntent(input: string): AssistantIntent | null {
  const normalizedInput = input.toLowerCase();
  const rankedIntent = assistantIntents
    .map((intent) => ({
      intent,
      score: intentKeywords[intent].filter((keyword) => normalizedInput.includes(keyword)).length
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)[0];

  return rankedIntent?.intent ?? null;
}

export function generateAssistantResponse(rawInput: string, rawLanguage: string): AssistantResult {
  const language = validateLanguage(rawLanguage);
  const sanitizedInput = sanitizeAssistantInput(rawInput);

  if (sanitizedInput.length === 0) {
    return { status: "error", language, reason: "empty", response: fallbackResponses[language].empty };
  }

  if (sanitizedInput.length > MAX_ASSISTANT_INPUT_LENGTH) {
    return { status: "error", language, reason: "too-long", response: fallbackResponses[language]["too-long"] };
  }

  const intent = detectIntent(sanitizedInput);
  if (intent === null) {
    return {
      status: "error",
      language,
      reason: "unknown-intent",
      response: fallbackResponses[language]["unknown-intent"]
    };
  }

  return {
    status: "success",
    language,
    intent,
    response: templates[language][intent].replace("{context}", stadiumContext[intent])
  };
}
