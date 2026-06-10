"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { captureFunnelEvent, getFunnelEventForPath } from "@/lib/funnel-events";
import { initPostHog } from "@/lib/posthog-client";

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const client = initPostHog();
    if (!client || !pathname) return;

    let url = window.origin + pathname;
    const query = searchParams.toString();
    if (query) {
      url += `?${query}`;
    }

    client.capture("$pageview", {
      $current_url: url,
      $pathname: pathname,
      $host: window.location.host,
      app: "renove-ai",
    });

    const funnelEvent = getFunnelEventForPath(pathname);
    if (funnelEvent) {
      captureFunnelEvent(client, funnelEvent, { path: pathname });
    }
  }, [pathname, searchParams]);

  return null;
}
