import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

export function isPostHogConfigured(): boolean {
  return Boolean(POSTHOG_KEY?.trim());
}

export function initPostHog(): typeof posthog | null {
  if (!isPostHogConfigured()) return null;
  if (typeof window === "undefined") return null;

  if (!posthog.__loaded) {
    posthog.init(POSTHOG_KEY!, {
      api_host: POSTHOG_HOST,
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
    posthog.register({ app: "renove-ai" });
  }

  return posthog;
}

export { posthog };
