"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreationForm } from "@/components/CreationForm";
import { CreditsPurchaseModal } from "@/components/CreditsPurchaseModal";
import { PRO_CREDITS } from "@/lib/credits";

type LimitState = {
  plan: string;
  creditsBalance: number;
  canGenerate: boolean;
  resetDate: string | null;
};

export default function NewCreationPage() {
  const [limit, setLimit] = useState<LimitState | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function loadLimit() {
      try {
        const res = await fetch("/api/generations/limit");
        if (res.ok) {
          const data = await res.json();
          setLimit({
            plan: data.plan,
            creditsBalance: data.creditsBalance,
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

  async function handleCreditsPurchase(plan: "credits_5" | "credits_15") {
    setCheckoutLoading(true);
    localStorage.setItem("selectedPlan", plan);
    document.cookie = `selectedPlan=${plan}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    window.location.href = `/api/stripe/checkout?plan=${plan}`;
  }

  if (loading) {
    return <div className="animate-pulse text-muted">Chargement...</div>;
  }

  const noCredits = limit && limit.creditsBalance <= 0;
  const isDiscovery = limit?.plan === "discovery";
  const isPro = limit?.plan === "pro";

  if (noCredits) {
    const resetLabel = limit?.resetDate
      ? new Date(limit.resetDate).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

    return (
      <div className="w-full max-w-[390px] mx-auto text-center px-2 py-12">
        {isDiscovery && (
          <>
            <p className="font-hero text-2xl font-bold text-foreground mb-8">
              Passer au Pro pour continuer →
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
              Voir les offres Pro →
            </Link>
          </>
        )}

        {isPro && (
          <>
            <p className="font-hero text-2xl font-bold text-foreground mb-3">
              Tu as utilisé tes {PRO_CREDITS} crédits ce mois 😔
            </p>
            {resetLabel && (
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
            )}
            <button
              type="button"
              onClick={() => setCreditsModalOpen(true)}
              className="inline-block w-full font-bold"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "16px",
                color: "#A0522D",
                backgroundColor: "transparent",
                border: "2px solid #A0522D",
                borderRadius: "50px",
                padding: "18px 20px",
              }}
            >
              Racheter des crédits →
            </button>
            <CreditsPurchaseModal
              open={creditsModalOpen}
              onClose={() => setCreditsModalOpen(false)}
              loading={checkoutLoading}
              onSelectPlan={handleCreditsPurchase}
            />
          </>
        )}
      </div>
    );
  }

  return <CreationForm />;
}
