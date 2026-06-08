"use client";

import { useEffect } from "react";

export default function GoToStripe() {

  useEffect(() => {
    const plan = localStorage.getItem("selectedPlan") || "monthly";
    window.location.href = `/api/stripe/checkout?plan=${plan}`;
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-muted">Redirection en cours...</p>
    </main>
  );
}
