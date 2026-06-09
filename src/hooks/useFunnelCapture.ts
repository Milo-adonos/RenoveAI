"use client";

import { useCallback } from "react";
import { usePostHog } from "posthog-js/react";
import { captureFunnelEvent } from "@/lib/funnel-events";

export function useFunnelCapture() {
  const posthog = usePostHog();

  return useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      captureFunnelEvent(posthog, event, properties);
    },
    [posthog]
  );
}
