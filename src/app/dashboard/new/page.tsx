"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreationForm } from "@/components/CreationForm";
import { MONTHLY_GENERATION_LIMIT } from "@/lib/generation-limits";

type LimitState = {
  plan: string;
  generationsUsed: number;
  canGenerate: boolean;
  resetDate: string;
};

export default function NewCreationPage() {
  const [limit, setLimit] = useState<LimitState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLimit() {
      try {
        const res = await fetch("/api/generations/limit");
        if (res.ok) {
          const data = await res.json();
          setLimit({
            plan: data.plan,
            generationsUsed: data.generationsUsed,
            canGenerate: data.canGenerate,
            resetDate: data.resetDate,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadLimit();
  }, []);

  if (loading) {
    return <div className="animate-pulse text-muted">Chargement...</div>;
  }

  const isMonthly = limit?.plan === "monthly";
  const limitReached =
    isMonthly &&
    limit &&
    limit.generationsUsed >= MONTHLY_GENERATION_LIMIT;

  if (limitReached) {
    const resetLabel = new Date(limit.resetDate).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="w-full max-w-[390px] mx-auto text-center px-2 py-12">
        <p
          className="font-hero text-2xl font-bold text-foreground mb-3"
          style={{ fontSize: "24px" }}
        >
          Tu as utilisé tes 30 générations ce mois 😔
        </p>
        <p
          className="mb-8"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "14px",
            color: "#8B7D6B",
          }}
        >
          Renouvellement le {resetLabel}
        </p>
        <Link
          href="/pricing"
          className="pricing-glow-cta inline-block w-full text-white font-bold"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "16px",
            backgroundColor: "#A0522D",
            borderRadius: "50px",
            padding: "18px 20px",
          }}
        >
          Passer à l&apos;annuel pour des générations illimitées →
        </Link>
      </div>
    );
  }

  return <CreationForm />;
}
