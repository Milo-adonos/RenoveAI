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
const PLAN_KEY = "selectedPlan";
const PREVIEW_SEEN_KEY = "renove_preview_seen";
const SELECTED_STYLE_KEY = "selectedStyle";
const ORIGINAL_IMAGE_URL_KEY = "originalImageUrl";
const ROOM_TYPE_KEY = "roomType";

export interface CheckoutSession {
  selectedStyle: string;
  originalImageUrl: string;
  roomType: string | null;
}

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

export function saveCheckoutSession(data: {
  selectedStyle?: string | null;
  originalImageUrl: string;
  roomType?: string | null;
}) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    SELECTED_STYLE_KEY,
    data.selectedStyle?.trim() ? data.selectedStyle : "custom"
  );
  sessionStorage.setItem(ORIGINAL_IMAGE_URL_KEY, data.originalImageUrl);

  if (data.roomType) {
    sessionStorage.setItem(ROOM_TYPE_KEY, data.roomType);
  } else {
    sessionStorage.removeItem(ROOM_TYPE_KEY);
  }
}

export function getCheckoutSession(): CheckoutSession | null {
  if (typeof window === "undefined") return null;

  const originalImageUrl = sessionStorage.getItem(ORIGINAL_IMAGE_URL_KEY);
  const selectedStyle = sessionStorage.getItem(SELECTED_STYLE_KEY);

  if (!originalImageUrl || !selectedStyle) return null;

  return {
    selectedStyle,
    originalImageUrl,
    roomType: sessionStorage.getItem(ROOM_TYPE_KEY),
  };
}

export function clearCheckoutSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SELECTED_STYLE_KEY);
  sessionStorage.removeItem(ORIGINAL_IMAGE_URL_KEY);
  sessionStorage.removeItem(ROOM_TYPE_KEY);
}

export type SubscriptionPlan =
  | "discovery"
  | "pro"
  | "credits_5"
  | "credits_15";

export function parsePlanValue(
  value: string | null | undefined
): SubscriptionPlan {
  if (
    value === "discovery" ||
    value === "pro" ||
    value === "credits_5" ||
    value === "credits_15"
  ) {
    return value;
  }
  return "discovery";
}

export function getPlan(): SubscriptionPlan {
  if (typeof window === "undefined") return "discovery";
  return parsePlanValue(localStorage.getItem(PLAN_KEY));
}

export function clearPlan() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PLAN_KEY);
}

export function getPlanLabel(plan: SubscriptionPlan): string {
  switch (plan) {
    case "discovery":
      return "Découverte";
    case "pro":
      return "Pro";
    case "credits_5":
      return "5 crédits";
    case "credits_15":
      return "15 crédits";
  }
}

export function getPlanPrice(plan: SubscriptionPlan): string {
  switch (plan) {
    case "discovery":
      return "4,90€";
    case "pro":
      return "12,99€/mois";
    case "credits_5":
      return "2,90€";
    case "credits_15":
      return "6,90€";
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
