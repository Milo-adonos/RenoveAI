"use client";

import { useEffect, useState } from "react";
import { clearPlan } from "@/lib/session";

export function WelcomeToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
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
      ✨ Ton rendu est prêt !
    </div>
  );
}
