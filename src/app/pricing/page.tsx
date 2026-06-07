"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { LiveCounter } from "@/components/LiveCounter";
import { savePlan } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";

const features = [
  "Essai gratuit 3 jours",
  "Générations illimitées",
  "Téléchargement HD",
  "Tous les styles disponibles",
  "Historique complet",
  "Annulable à tout moment",
];

export default function PricingPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<"weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    savePlan(plan);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      window.location.href = `/api/stripe/checkout?plan=${plan}`;
    } else {
      router.push("/auth/signup");
    }
  }

  return (
    <main className="min-h-screen pb-12">
      <Header showLogin={false} />

      <div className="px-4 max-w-lg mx-auto">
        <h1 className="font-display text-3xl font-bold text-center mb-2">
          Ton rendu est prêt 🎁
        </h1>
        <p className="text-muted text-center mb-8">
          Annulable à tout moment, sans engagement
        </p>

        {/* Toggle */}
        <div className="flex bg-card rounded-2xl p-1 mb-8 shadow-soft">
          <button
            onClick={() => setPlan("weekly")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              plan === "weekly" ? "bg-accent text-white" : "text-muted"
            }`}
          >
            Hebdomadaire
          </button>
          <button
            onClick={() => setPlan("monthly")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              plan === "monthly" ? "bg-accent text-white" : "text-muted"
            }`}
          >
            Mensuel
          </button>
        </div>

        {/* Plan card */}
        <div className="card border-2 border-accent relative">
          {plan === "weekly" && (
            <span className="absolute -top-3 left-4 bg-accent text-white text-xs px-3 py-1 rounded-full">
              LE PLUS POPULAIRE
            </span>
          )}
          {plan === "monthly" && (
            <span className="absolute -top-3 left-4 bg-foreground text-white text-xs px-3 py-1 rounded-full">
              MEILLEUR RAPPORT
            </span>
          )}

          <div className="mt-2">
            {plan === "weekly" ? (
              <div className="flex items-baseline gap-2">
                <span className="text-muted line-through text-lg">9,99€</span>
                <span className="text-4xl font-bold text-accent">4,99€</span>
                <span className="text-muted">/semaine</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full ml-auto">
                  -50%
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-accent">9,99€</span>
                <span className="text-muted">/mois</span>
              </div>
            )}
          </div>

          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✅</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 space-y-3 text-center text-sm text-muted">
          <p>🛡️ Satisfait ou remboursé 7 jours</p>
          <LiveCounter />
          <p className="text-xs">Paiement sécurisé par Stripe</p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn-primary mt-8 disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Commencer l'essai gratuit →"}
        </button>
      </div>
    </main>
  );
}
