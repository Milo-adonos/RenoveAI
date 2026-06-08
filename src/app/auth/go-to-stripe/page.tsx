"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoToStripe() {
  const router = useRouter();

  useEffect(() => {
    const plan = localStorage.getItem("selectedPlan") || "monthly";
    router.push(`/api/stripe/checkout?plan=${plan}`);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-muted">Redirection en cours...</p>
    </main>
  );
}
