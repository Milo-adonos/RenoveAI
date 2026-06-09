"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { captureFunnelEvent, getFunnelEventForPath } from "@/lib/funnel-events";

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (!pathname || !posthogClient) return;

    let url = window.origin + pathname;
    const query = searchParams.toString();
    if (query) {
      url += `?${query}`;
    }

    posthogClient.capture("$pageview", { $current_url: url });

    const funnelEvent = getFunnelEventForPath(pathname);
    if (funnelEvent) {
      captureFunnelEvent(posthogClient, funnelEvent, { path: pathname });
    }
  }, [pathname, searchParams, posthogClient]);

  return null;
}
