"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionPlan } from "@/lib/session";
import {
  formatPricingTimer,
  getPricingTimerEnd,
  isPricingTimerExpired,
} from "@/lib/pricing-timer";
import { FUNNEL } from "@/lib/funnel-events";
import { useFunnelCapture } from "@/hooks/useFunnelCapture";
import { createClient } from "@/lib/supabase/client";

const UNLOCK_COUNT_KEY = "renove_pricing_unlock_count";
const UNLOCK_RESET_HOUR = 15;

const monthlyFeatures = [
  "Générations illimitées",
  "Téléchargement HD",
  "19 styles disponibles",
  "Historique complet",
  "Support prioritaire",
];

const weeklyFeatures = [
  "20 générations par semaine",
  "Téléchargement HD",
  "19 styles disponibles",
  "Historique limité à 7 jours",
];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((feature) => (
        <li
          key={feature}
          className="flex items-start gap-2 text-sm text-foreground"
        >
          <span className="text-accent flex-shrink-0">✦</span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function getDailyUnlockCount(): number {
  const now = new Date();
  const resetToday = new Date(now);
  resetToday.setHours(UNLOCK_RESET_HOUR, 0, 0, 0);

  let periodStart = resetToday.getTime();
  if (now.getTime() < periodStart) {
    periodStart -= 24 * 60 * 60 * 1000;
  }

  const stored = localStorage.getItem(UNLOCK_COUNT_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as {
        periodStart: number;
        count: number;
      };
      if (parsed.periodStart === periodStart && parsed.count >= 847) {
        return parsed.count;
      }
    } catch {
      // ignore invalid storage
    }
  }

  const count = Math.floor(Math.random() * (1243 - 847 + 1)) + 847;
  localStorage.setItem(
    UNLOCK_COUNT_KEY,
    JSON.stringify({ periodStart, count })
  );
  return count;
}

function formatUnlockCount(count: number): string {
  return new Intl.NumberFormat("fr-FR").format(count);
}

function setSelectedPlan(plan: SubscriptionPlan) {
  localStorage.setItem("selectedPlan", plan);
  document.cookie = `selectedPlan=${plan}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export default function PricingPage() {
  const router = useRouter();
  const captureFunnel = useFunnelCapture();
  const [selectedPlan, setSelectedPlanState] = useState<SubscriptionPlan>("monthly");
  const [loading, setLoading] = useState(false);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [unlockCount, setUnlockCount] = useState<number | null>(null);

  useEffect(() => {
    const end = getPricingTimerEnd();
    setTimerEnd(end);
    setRemainingMs(end - Date.now());
    setUnlockCount(getDailyUnlockCount());
  }, []);

  useEffect(() => {
    if (!timerEnd) return;

    const interval = setInterval(() => {
      setRemainingMs(timerEnd - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEnd]);

  const expired = isPricingTimerExpired(remainingMs);
  const isMonthly = selectedPlan === "monthly";

  const formattedUnlockCount = useMemo(() => {
    if (unlockCount === null) return "…";
    return formatUnlockCount(unlockCount);
  }, [unlockCount]);

  async function handleUnlock() {
    captureFunnel(FUNNEL.unlockClicked, { plan: selectedPlan });
    captureFunnel(FUNNEL.planSelected, { plan: selectedPlan });
    setLoading(true);
    setSelectedPlan(selectedPlan);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      window.location.href = `/api/stripe/checkout?plan=${selectedPlan}`;
      return;
    }

    router.push("/auth/signup");
  }

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="px-5 pt-6 max-w-[390px] mx-auto w-full">
        <p className="font-hero text-[20px] font-bold text-[#A0522D] text-center pricing-reveal-item pricing-reveal-delay-1">
          Renove AI
        </p>

        <div className="pricing-reveal-item pricing-reveal-delay-2">
          <h1 className="font-hero text-[26px] font-bold text-[#1A1A1A] text-center mt-5">
            Ton rendu t&apos;attend ✨
          </h1>
          <p
            className="text-center mt-2 mb-6"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "13px",
              color: "#8B7D6B",
            }}
          >
            Annulable à tout moment, sans engagement
          </p>
        </div>

        <div
          className="relative flex p-1 mb-5 pricing-reveal-item pricing-reveal-delay-3"
          style={{ backgroundColor: "#EDE8E3", borderRadius: "50px" }}
        >
          <button
            type="button"
            onClick={() => setSelectedPlanState("weekly")}
            className="relative flex-1 rounded-[50px] py-2.5 text-sm transition-all"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: selectedPlan === "weekly" ? 700 : 500,
              color: selectedPlan === "weekly" ? "#1A1A1A" : "#8B7D6B",
              backgroundColor:
                selectedPlan === "weekly" ? "#FFFFFF" : "transparent",
              boxShadow:
                selectedPlan === "weekly"
                  ? "0 2px 8px rgba(0, 0, 0, 0.06)"
                  : "none",
            }}
          >
            Hebdo
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlanState("monthly")}
            className="relative flex-1 rounded-[50px] py-2.5 text-sm transition-all"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: selectedPlan === "monthly" ? 700 : 500,
              color: selectedPlan === "monthly" ? "#1A1A1A" : "#8B7D6B",
              backgroundColor:
                selectedPlan === "monthly" ? "#FFFFFF" : "transparent",
              boxShadow:
                selectedPlan === "monthly"
                  ? "0 2px 8px rgba(0, 0, 0, 0.06)"
                  : "none",
            }}
          >
            Mensuel
            <span
              className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                color: "#2E7D32",
                backgroundColor: "#E8F5E9",
              }}
            >
              PLUS ÉCONOMIQUE
            </span>
          </button>
        </div>

        <div
          className="relative rounded-2xl bg-white p-5 pricing-reveal-item pricing-reveal-delay-4"
          style={{
            border: "1px solid #F0EBE5",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <span
            className="absolute -top-3 left-4 z-10 rounded-lg font-bold text-white"
            style={{
              backgroundColor: "#A0522D",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "18px",
              padding: "10px 16px",
              transform: "rotate(-6deg)",
              boxShadow: "0 4px 12px rgba(160, 82, 45, 0.4)",
            }}
          >
            -50%
          </span>

          {isMonthly ? (
            <>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span
                  className="line-through"
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "14px",
                    color: "#8B7D6B",
                  }}
                >
                  19,99€
                </span>
                <span className="font-hero text-[38px] font-bold text-[#1A1A1A] leading-none">
                  9,99€
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "14px",
                    color: "#8B7D6B",
                  }}
                >
                  /mois
                </span>
              </div>
              <div className="my-4 h-px bg-[#F0EBE5]" />
              <FeatureList items={monthlyFeatures} />
            </>
          ) : (
            <>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span
                  className="line-through"
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "14px",
                    color: "#8B7D6B",
                  }}
                >
                  9,99€
                </span>
                <span className="font-hero text-[38px] font-bold text-[#1A1A1A] leading-none">
                  4,99€
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "14px",
                    color: "#8B7D6B",
                  }}
                >
                  /semaine
                </span>
              </div>
              <p
                className="mt-2 font-bold"
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: "12px",
                  color: "#C0392B",
                }}
              >
                soit 21,62€/mois
              </p>
              <div className="my-4 h-px bg-[#F0EBE5]" />
              <FeatureList items={weeklyFeatures} />
            </>
          )}
        </div>

        <div className="mt-4 space-y-3 pricing-reveal-item pricing-reveal-delay-5">
          <div
            style={{
              backgroundColor: "#F0E6DE",
              borderRadius: "12px",
              padding: "14px 20px",
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <span style={{ fontSize: "18px" }} aria-hidden="true">
                🛡️
              </span>
              <span
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#A0522D",
                }}
              >
                Satisfait ou remboursé&nbsp;&nbsp;7 jours
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#F0E6DE",
              borderRadius: "12px",
              padding: "14px 20px",
            }}
          >
            <p
              className="flex items-center justify-center gap-2 flex-wrap"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "14px",
                color: "#1A1A1A",
              }}
            >
              <span
                className="pricing-live-dot inline-block flex-shrink-0 rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#4CAF50",
                }}
                aria-hidden="true"
              />
              <span>
                <span style={{ fontWeight: 700, color: "#A0522D" }}>
                  {formattedUnlockCount}
                </span>{" "}
                utilisateurs ont débloqué leur rendu aujourd&apos;hui
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUnlock}
          disabled={loading}
          className="pricing-glow-cta w-full mt-5 text-white font-bold transition-colors disabled:opacity-50 pricing-reveal-item pricing-reveal-delay-6"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "18px",
            backgroundColor: "#A0522D",
            borderRadius: "50px",
            padding: "20px",
          }}
        >
          {loading ? "Chargement..." : "Débloquer mon rendu →"}
        </button>

        <div className="mt-5 space-y-2 text-center pricing-reveal-item pricing-reveal-delay-7">
          <p
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "12px",
              color: "#8B7D6B",
            }}
          >
            {expired ? (
              "⚠️ Offre expirée"
            ) : (
              <>
                ⏳ Cette offre expire dans{" "}
                <span className="tabular-nums font-semibold">
                  {formatPricingTimer(remainingMs)}
                </span>
              </>
            )}
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "11px",
              color: "#8B7D6B",
            }}
          >
            🔒 Paiement sécurisé par Stripe
          </p>
        </div>
      </div>
    </main>
  );
}
