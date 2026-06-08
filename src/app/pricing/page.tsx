"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import type { SubscriptionPlan } from "@/lib/session";
import {
  formatPricingTimer,
  getPricingTimerEnd,
  isPricingTimerExpired,
} from "@/lib/pricing-timer";
const monthlyFeatures = [
  "Générations illimitées",
  "Téléchargement HD",
  "18 styles disponibles",
  "Historique complet de toutes tes créations",
  "Accès en priorité aux nouveaux styles",
  "Support client prioritaire",
  "Annulable à tout moment",
];

const weeklyFeatures = [
  "20 générations par semaine (pas illimité)",
  "Téléchargement HD",
  "18 styles disponibles",
  "Historique limité à 7 jours",
  "Support standard",
];

const avoids = [
  "Des heures sur Pinterest sans résultat concret",
  "Acheter des meubles qui vont pas ensemble",
  "Payer un décorateur à 150€+ la consultation",
  "Regretter tes choix après avoir tout acheté",
  "Vivre dans une pièce qui te ressemble pas",
];

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#A0522D" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

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

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  useEffect(() => {
    const end = getPricingTimerEnd();
    setTimerEnd(end);
    setRemainingMs(end - Date.now());
  }, []);

  useEffect(() => {
    if (!timerEnd) return;

    const interval = setInterval(() => {
      setRemainingMs(timerEnd - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEnd]);

  const expired = isPricingTimerExpired(remainingMs);

  function handlePlanSelect(plan: "monthly" | "weekly") {
    setLoadingPlan(plan);
    localStorage.setItem("selectedPlan", plan);
    router.push("/auth/signup");
  }

  return (
    <main className="min-h-screen pb-8">
      <Header showLogin={false} />

      <div className="px-4 max-w-lg mx-auto">
        {/* 1. Titre + sous-titre */}
        <h1 className="font-hero text-3xl sm:text-4xl font-bold text-center mb-2 text-foreground">
          Ton rendu t&apos;attend ✨
        </h1>
        <p className="text-muted text-center mb-8">
          Transforme ta pièce en 30 secondes
        </p>

        {/* 2. Ce que tu évites */}
        <section className="mb-4">
          <h2 className="font-hero text-lg sm:text-xl font-bold text-center mb-6 text-foreground leading-snug px-1">
            Ce que tu{" "}
            <span className="text-accent relative inline-block">
              évites
              <svg
                className="absolute -bottom-1 left-0 w-full h-3 text-accent"
                viewBox="0 0 120 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8C20 2 40 10 60 6C80 2 100 10 118 4"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            avec <span className="whitespace-nowrap">Renove AI</span>
          </h2>
          <ul className="space-y-3">
            {avoids.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm sm:text-base text-foreground"
              >
                <span className="text-accent flex-shrink-0">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Accroche prix */}
        <p className="text-accent font-bold text-center mb-8">
          Tout ça pour moins de 33 centimes par jour.
        </p>

        {/* 4. Plan mensuel */}
        <div
          className="card border-2 border-accent mb-4"
          style={{ boxShadow: "0 8px 32px rgba(160, 82, 45, 0.2)" }}
        >
          <span
            className="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: "#A0522D",
              boxShadow: "0 2px 8px rgba(160, 82, 45, 0.3)",
            }}
          >
            ⭐ LE PLUS POPULAIRE
          </span>
          <p className="text-muted text-sm italic mt-4">
            Un décorateur coûte 150€/consultation.
          </p>
          <p className="text-muted text-sm italic">Toi tu payes...</p>
          <span className="inline-block mt-4 bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full">
            🔥 Offre de lancement — prix limité
          </span>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-muted line-through text-lg">19,99€</span>
            <span
              className="bg-accent text-white font-bold rounded-full"
              style={{ fontSize: 14, padding: "4px 10px" }}
            >
              -50%
            </span>
          </div>
          <div className="mt-1">
            <span className="font-hero text-4xl font-bold text-accent">
              9,99€
            </span>
            <span className="text-muted text-base">/mois</span>
          </div>
          <FeatureList items={monthlyFeatures} />
          <button
            type="button"
            onClick={() => handlePlanSelect("monthly")}
            disabled={loadingPlan !== null}
            className="pricing-glow-cta w-full bg-accent hover:bg-accent-hover text-white font-bold text-base py-4 px-6 rounded-2xl transition-colors mt-6 disabled:opacity-50"
          >
            {loadingPlan === "monthly"
              ? "Chargement..."
              : "Choisir le mensuel →"}
          </button>
        </div>

        {/* 5. Plan hebdomadaire */}
        <div className="card opacity-85 mb-4">
          <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
            ⚠️ MOINS ÉCONOMIQUE
          </span>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">4,99€</span>
            <span className="text-muted text-sm">/semaine</span>
          </div>
          <FeatureList items={weeklyFeatures} />
          <p className="text-[#C0392B] font-bold text-sm mt-3">
            ✦ soit 21,62€/mois
          </p>
          <button
            type="button"
            onClick={() => handlePlanSelect("weekly")}
            disabled={loadingPlan !== null}
            className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-white font-bold text-base py-4 px-6 rounded-2xl transition-colors mt-6 disabled:opacity-50"
          >
            {loadingPlan === "weekly"
              ? "Chargement..."
              : "Choisir l'hebdomadaire →"}
          </button>
        </div>

        {/* 6. Préférence mensuel */}
        <p className="text-center text-muted text-sm italic mb-8 whitespace-nowrap">
          Le mensuel est 4x moins cher sur la durée
        </p>

        {/* 7. Timer */}
        <div className="text-center mb-8">
          {expired ? (
            <p className="text-[#C0392B] font-semibold text-base">
              ⚠️ Offre expirée — prix standard : 14,99€/mois
            </p>
          ) : (
            <p className="text-foreground font-medium text-base">
              ⏳ Cette offre expire dans{" "}
              <span className="font-bold text-accent tabular-nums">
                {formatPricingTimer(remainingMs)}
              </span>
            </p>
          )}
        </div>

        {/* 8. Garantie */}
        <section
          className="rounded-2xl p-6 mb-6 text-center"
          style={{ backgroundColor: "#FDF0E8" }}
        >
          <p className="text-2xl mb-3">🛡️</p>
          <h3 className="font-hero text-xl font-bold text-foreground mb-4">
            Notre promesse béton
          </h3>
          <p className="text-base text-foreground leading-relaxed text-left px-4">
            Si dans les 7 jours tu n&apos;es pas bluffé par ton rendu, on te
            rembourse intégralement. Sans question. Sans délai. Tu gardes même tes
            créations.
          </p>
          <p className="text-accent italic mt-4 text-sm text-left px-4">
            C&apos;est nous qui prenons le risque, pas toi.
          </p>
        </section>

        {/* 9. Comparaison */}
        <section className="bg-white rounded-2xl p-5 mb-4 text-left">
          <p className="text-base text-[#1A1A1A] leading-relaxed">
            Un décorateur d&apos;intérieur coûte entre 150€ et 500€ la
            consultation. Renove AI te donne accès à une IA entraînée sur des
            milliers d&apos;intérieurs pour moins de 33 centimes par jour.
          </p>
          <p className="text-accent font-bold mt-4 text-base leading-snug text-balance">
            C&apos;est le prix d&apos;un café ☕ pour transformer{" "}
            <span className="whitespace-nowrap">ta pièce.</span>
          </p>
        </section>

        {/* 10. Social proof */}
        <div className="flex items-center justify-center gap-1.5 mb-6 text-[14px] text-[#8B7E74]">
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="whitespace-nowrap">
            4,8/5 — +2 300 utilisateurs satisfaits
          </span>
        </div>

        {/* 11. Réassurance */}
        <div
          className="space-y-2 text-center text-sm text-muted leading-relaxed px-2"
          style={{ paddingBottom: 20 }}
        >
          <p className="break-words">
            🔒 Paiement sécurisé par Stripe
            <br />
            Annulable à tout moment
          </p>
          <p>🛡️ Satisfait ou remboursé 7 jours</p>
        </div>
      </div>
    </main>
  );
}
