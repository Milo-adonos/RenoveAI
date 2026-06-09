"use client";

import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useState } from "react";
import { initPostHog, isPostHogConfigured, posthog } from "@/lib/posthog-client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isPostHogConfigured()) return;
    initPostHog();
    setReady(true);
  }, []);

  if (!isPostHogConfigured() || !ready) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
