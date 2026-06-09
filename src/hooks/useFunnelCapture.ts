"use client";

import { useCallback } from "react";
import { captureFunnelEvent } from "@/lib/funnel-events";
import { initPostHog } from "@/lib/posthog-client";

export function useFunnelCapture() {
  return useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      captureFunnelEvent(initPostHog(), event, properties);
    },
    []
  );
}
