import { MAX_ASSISTANT_INPUT_LENGTH } from "../config/assistant";
import {
  type AssistantIntent,
  type AssistantResult,
  type StadiumAIResponse,
  type SupportedLanguage
} from "../contracts/stadium";

export type OfflineFailureReason = Extract<AssistantResult, { status: "error" }>["reason"];

export const intentKeywords: Record<AssistantIntent, readonly string[]> = {
  navigation: ["gate", "seat", "section", "route", "navigate", "navigation", "where", "entrada", "porte"],
  crowd: ["crowd", "busy", "line", "queue", "wait", "congestion", "fila", "foule"],
  accessibility: ["accessible", "wheelchair", "restroom", "quiet", "sensory", "accessibility", "accesible"],
  transportation: ["transport", "train", "rail", "shuttle", "exit", "bus", "metro", "transporte"],
  medical: ["medical", "first aid", "doctor", "injury", "help", "medico", "medicale"],
  sustainability: ["water", "refill", "recycle", "waste", "sustainability", "green", "agua", "eau"],
  operations: ["staff", "volunteer", "organizer", "operations", "team", "voluntario", "benevole"]
};

export const responseTemplates: Record<SupportedLanguage, Record<AssistantIntent, string>> = {
  en: {
    navigation: "Navigation recommendation: {context}",
    crowd: "Crowd recommendation: {context}",
    accessibility: "Accessibility recommendation: {context}",
    transportation: "Transportation recommendation: {context}",
    medical: "Medical assistance recommendation: {context}",
    sustainability: "Sustainability recommendation: {context}",
    operations: "Operations support recommendation: {context}"
  },
  es: {
    navigation: "Recomendacion de navegacion: {context}",
    crowd: "Recomendacion de aforo: {context}",
    accessibility: "Recomendacion de accesibilidad: {context}",
    transportation: "Recomendacion de transporte: {context}",
    medical: "Recomendacion de asistencia medica: {context}",
    sustainability: "Recomendacion de sostenibilidad: {context}",
    operations: "Recomendacion para operaciones, personal y voluntarios: {context}"
  },
  fr: {
    navigation: "Recommandation de navigation : {context}",
    crowd: "Recommandation de gestion de foule : {context}",
    accessibility: "Recommandation d'accessibilite : {context}",
    transportation: "Recommandation de transport : {context}",
    medical: "Recommandation d'assistance medicale : {context}",
    sustainability: "Recommandation de durabilite : {context}",
    operations: "Recommandation pour les operations, le personnel et les benevoles : {context}"
  }
};

export const fallbackResponses: Record<SupportedLanguage, Record<OfflineFailureReason, string>> = {
  en: {
    empty: "Please enter a stadium question so StadiumPulse AI can help.",
    "too-long": `Please keep the request within ${MAX_ASSISTANT_INPUT_LENGTH} characters.`,
    "unknown-intent":
      "StadiumPulse AI can help with navigation, crowd level, accessibility, transportation, medical assistance, sustainability, or operations support."
  },
  es: {
    empty: "Escribe una pregunta del estadio para que StadiumPulse AI pueda ayudar.",
    "too-long": `Manten la solicitud dentro de ${MAX_ASSISTANT_INPUT_LENGTH} caracteres.`,
    "unknown-intent":
      "StadiumPulse AI ayuda con navegacion, aforo, accesibilidad, transporte, asistencia medica, sostenibilidad o apoyo de operaciones."
  },
  fr: {
    empty: "Saisissez une question sur le stade afin que StadiumPulse AI puisse aider.",
    "too-long": `Veuillez limiter la demande a ${MAX_ASSISTANT_INPUT_LENGTH} caracteres.`,
    "unknown-intent":
      "StadiumPulse AI aide pour la navigation, la foule, l'accessibilite, le transport, l'assistance medicale, la durabilite ou les operations."
  }
};

export const recommendedActions: Record<AssistantIntent, string> = {
  navigation: "Guide the user to the clearest signed route and confirm their section before they move.",
  crowd: "Redirect fans away from high-pressure gates and keep volunteer guidance visible.",
  accessibility: "Send the user to the step-free entrance and keep accessibility support available nearby.",
  transportation: "Direct the user toward rail and accessible shuttle pickup at the transport exit.",
  medical: "Route the user to the medical assistance desk and escalate urgent symptoms to venue staff.",
  sustainability: "Point the user to refill and waste-sorting stations before they enter dense concourse areas.",
  operations: "Escalate the concern to the operations desk before redirecting fans or changing queues."
};

export const alternativeLocations: Record<AssistantIntent, string> = {
  navigation: "Gate B",
  crowd: "Gate B",
  accessibility: "Accessible Entrance E",
  transportation: "Transport Exit T",
  medical: "Section 112 medical assistance desk",
  sustainability: "Food Zone F",
  operations: "Operations desk"
};

export const urgencyByIntent: Record<AssistantIntent, StadiumAIResponse["urgency"]> = {
  navigation: "low",
  crowd: "high",
  accessibility: "medium",
  transportation: "medium",
  medical: "high",
  sustainability: "low",
  operations: "medium"
};

export const targetUserByIntent: Record<AssistantIntent, StadiumAIResponse["targetUser"]> = {
  navigation: "fan",
  crowd: "staff",
  accessibility: "fan",
  transportation: "fan",
  medical: "staff",
  sustainability: "fan",
  operations: "volunteer"
};
