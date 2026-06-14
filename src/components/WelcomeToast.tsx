"use client";

import { useEffect, useState } from "react";
import { clearPlan, getPlan } from "@/lib/session";
import { captureFunnelEvent, FUNNEL } from "@/lib/funnel-events";
import { initPostHog, posthog } from "@/lib/posthog-client";

export function WelcomeToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const plan = getPlan();
      initPostHog();
      captureFunnelEvent(posthog, FUNNEL.paymentCompleted, { plan });

      clearPlan();
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);

      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      const clean = url.pathname + (url.search || "");
      window.history.replaceState({}, "", clean);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-accent text-white px-6 py-3 rounded-2xl shadow-lg animate-fade-in">
      ✨ Abonnement activé !
    </div>
  );
}
