import type { PostHog } from "posthog-js";

/** Événements funnel — à utiliser dans PostHog → Insights → Funnel */
export const FUNNEL = {
  landing: "funnel_landing",
  upload: "funnel_upload",
  loading: "funnel_loading",
  preview: "funnel_preview",
  pricing: "funnel_pricing",
  signup: "funnel_signup",
  login: "funnel_login",
  creations: "funnel_creations",
  newGeneration: "funnel_new_generation",
  generationStarted: "funnel_generation_started",
  generationCompleted: "funnel_generation_completed",
  generationFailed: "funnel_generation_failed",
  unlockClicked: "funnel_unlock_clicked",
  planSelected: "funnel_plan_selected",
} as const;

const PATH_TO_FUNNEL: Record<string, string> = {
  "/": FUNNEL.landing,
  "/upload": FUNNEL.upload,
  "/loading": FUNNEL.loading,
  "/preview": FUNNEL.preview,
  "/pricing": FUNNEL.pricing,
  "/auth/signup": FUNNEL.signup,
  "/auth/login": FUNNEL.login,
  "/dashboard/creations": FUNNEL.creations,
  "/dashboard/new": FUNNEL.newGeneration,
};

export function getFunnelEventForPath(pathname: string): string | null {
  return PATH_TO_FUNNEL[pathname] ?? null;
}

export function captureFunnelEvent(
  client: PostHog | null | undefined,
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!client) return;

  client.capture(event, {
    funnel_step: true,
    ...properties,
  });
}
