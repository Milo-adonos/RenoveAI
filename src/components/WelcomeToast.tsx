"use client";

import { useEffect, useState } from "react";

export function WelcomeToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      window.history.replaceState({}, "", "/dashboard");
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-accent text-white px-6 py-3 rounded-2xl shadow-lg animate-fade-in">
      🎉 Bienvenue ! Ton rendu est prêt
    </div>
  );
}
