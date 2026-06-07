export interface GenerationSession {
  originalUrl: string;
  generatedUrl?: string;
  style?: string;
  customPrompt?: string;
  timestamp: number;
  originalPath?: string;
  originalWidth?: number;
  originalHeight?: number;
}

const SESSION_KEY = "renove_generation";
const PLAN_KEY = "renove_plan";
const PREVIEW_SEEN_KEY = "renove_preview_seen";

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
    originalWidth: data.originalWidth ?? existing?.originalWidth,
    originalHeight: data.originalHeight ?? existing?.originalHeight,
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

export type SubscriptionPlan = "weekly" | "monthly" | "annual";

export function savePlan(plan: SubscriptionPlan) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PLAN_KEY, plan);
}

export function getPlan(): SubscriptionPlan {
  if (typeof window === "undefined") return "monthly";
  return (sessionStorage.getItem(PLAN_KEY) as SubscriptionPlan) || "monthly";
}

export function getPlanLabel(plan: SubscriptionPlan): string {
  switch (plan) {
    case "weekly":
      return "Hebdomadaire";
    case "monthly":
      return "Mensuel";
    case "annual":
      return "Annuel";
  }
}

export function isPreviewAnimationSeen(timestamp: number): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PREVIEW_SEEN_KEY) === String(timestamp);
}

export function markPreviewAnimationSeen(timestamp: number): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PREVIEW_SEEN_KEY, String(timestamp));
}
