export interface GenerationSession {
  originalUrl: string;
  generatedUrl?: string;
  style?: string;
  customPrompt?: string;
  timestamp: number;
  originalPath?: string;
}

const SESSION_KEY = "renove_generation";
const PLAN_KEY = "renove_plan";

export function saveGeneration(data: Partial<GenerationSession>) {
  if (typeof window === "undefined") return;
  const existing = getGeneration();
  const merged: GenerationSession = {
    originalUrl: data.originalUrl ?? existing?.originalUrl ?? "",
    generatedUrl: data.generatedUrl ?? existing?.generatedUrl,
    style: data.style ?? existing?.style,
    customPrompt: data.customPrompt ?? existing?.customPrompt,
    timestamp: data.timestamp ?? Date.now(),
    originalPath: data.originalPath ?? existing?.originalPath,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(merged));
}

export function getGeneration(): GenerationSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GenerationSession;
  } catch {
    return null;
  }
}

export function clearGeneration() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function savePlan(plan: "weekly" | "monthly") {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PLAN_KEY, plan);
}

export function getPlan(): "weekly" | "monthly" {
  if (typeof window === "undefined") return "weekly";
  return (sessionStorage.getItem(PLAN_KEY) as "weekly" | "monthly") || "weekly";
}
