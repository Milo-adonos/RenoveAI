"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { isBypassAuthEnabled, getDevBypassUser } from "@/lib/dev-bypass";
import {
  DISCOVERY_CREDITS,
  PRO_CREDITS,
  getCreditsProgress,
  getCreditsUsed,
  getPlanCreditLimit,
} from "@/lib/credits";
import { LogoutButton } from "@/components/LogoutButton";
import { CreditsPurchaseModal } from "@/components/CreditsPurchaseModal";

type LimitInfo = {
  plan: string;
  creditsBalance: number;
  creditsLimit: number;
  resetDate: string | null;
};

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [limit, setLimit] = useState<LimitInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (isBypassAuthEnabled()) {
        const devUser = getDevBypassUser();
        setProfile({
          id: devUser?.id || "dev-user-123",
          email: devUser?.email || "dev@renoveai.com",
          full_name: "Développeur",
          avatar_url: null,
          stripe_customer_id: null,
          subscription_status: devUser?.subscription_status || "active",
          subscription_plan: devUser?.subscription_plan || "pro",
          subscription_end_date: null,
          trial_end_date: null,
          credits_balance: PRO_CREDITS,
          credits_reset_date: null,
          created_at: new Date().toISOString(),
        });
        setLimit({
          plan: devUser?.subscription_plan || "pro",
          creditsBalance: PRO_CREDITS,
          creditsLimit: PRO_CREDITS,
          resetDate: null,
        });
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);

      const limitRes = await fetch("/api/generations/limit");
      if (limitRes.ok) {
        const limitData = await limitRes.json();
        setLimit({
          plan: limitData.plan,
          creditsBalance: limitData.creditsBalance,
          creditsLimit: limitData.creditsLimit,
          resetDate: limitData.resetDate,
        });
      }

      setLoading(false);
    }

    load();
  }, []);

  async function handleCreditsPurchase(plan: "credits_5" | "credits_15") {
    setCheckoutLoading(true);
    localStorage.setItem("selectedPlan", plan);
    document.cookie = `selectedPlan=${plan}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    window.location.href = `/api/stripe/checkout?plan=${plan}`;
  }

  if (loading || !profile) {
    return <div className="animate-pulse text-muted">Chargement...</div>;
  }

  const isActive = profile.subscription_status === "active";
  const plan = profile.subscription_plan || "inactive";
  const isDiscovery = plan === "discovery";
  const isPro = plan === "pro";
  const firstName = profile.full_name?.split(" ")[0] || "Utilisateur";
  const initial = firstName[0]?.toUpperCase() || "?";
  const creditsBalance = limit?.creditsBalance ?? profile.credits_balance ?? 0;
  const creditsLimit = limit?.creditsLimit ?? getPlanCreditLimit(plan);
  const creditsUsed = getCreditsUsed({
    ...profile,
    credits_balance: creditsBalance,
  });
  const progressPct = getCreditsProgress({
    ...profile,
    credits_balance: creditsBalance,
  });
  const noCredits = creditsBalance <= 0;

  async function saveName() {
    if (!profile) return;

    const trimmed = editName.trim();
    if (!trimmed) {
      setNameError("Le nom ne peut pas être vide");
      return;
    }

    setSavingName(true);
    setNameError("");

    if (isBypassAuthEnabled()) {
      setProfile((prev) =>
        prev ? { ...prev, full_name: trimmed } : prev
      );
      setEditingName(false);
      setSavingName(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", profile.id);

    if (error) {
      setNameError("Erreur lors de la sauvegarde");
      setSavingName(false);
      return;
    }

    setProfile((prev) =>
      prev ? { ...prev, full_name: trimmed } : prev
    );
    setEditingName(false);
    setSavingName(false);
  }

  function cancelEditName() {
    if (!profile) return;
    setEditName(profile.full_name || "");
    setEditingName(false);
    setNameError("");
  }

  const resetLabel = (limit?.resetDate || profile.credits_reset_date)
    ? new Date(limit?.resetDate || profile.credits_reset_date!).toLocaleDateString(
        "fr-FR",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  return (
    <div className="max-w-lg">
      <h1 className="font-hero text-2xl font-bold mb-8">Mon compte</h1>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-[60px] h-[60px] rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full font-hero text-xl font-bold text-foreground bg-background border border-muted/30 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  autoFocus
                />
                {nameError && (
                  <p className="text-red-600 text-xs">{nameError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveName}
                    disabled={savingName}
                    className="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {savingName ? "..." : "Sauvegarder"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditName}
                    disabled={savingName}
                    className="text-sm text-muted border border-muted/30 px-4 py-2 rounded-xl hover:bg-background transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditName(profile.full_name || firstName);
                  setEditingName(true);
                  setNameError("");
                }}
                className="font-hero text-xl font-bold text-foreground text-left hover:text-accent transition-colors"
              >
                {profile.full_name || firstName}
              </button>
            )}
            <p className="text-sm text-muted mt-1">{profile.email}</p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Mon abonnement</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
              {isDiscovery
                ? "Découverte — 4,90€"
                : isPro
                  ? "Pro — 12,99€/mois"
                  : "Inactif"}
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isActive ? "Actif" : "Inactif"}
            </span>
          </div>
          {isPro && resetLabel && (
            <p className="text-sm text-muted">Renouvellement le {resetLabel}</p>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-hero text-lg font-bold mb-4">Tes crédits</h2>
        <p className="font-hero text-4xl font-bold text-accent mb-4">
          {`${creditsBalance} crédit${creditsBalance > 1 ? "s" : ""} restant${creditsBalance > 1 ? "s" : ""}`}
        </p>

        {creditsLimit > 0 && (
          <div>
            <p className="text-sm text-muted mb-2">
              {creditsUsed}/{creditsLimit} utilisés
            </p>
            <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-accent"
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </div>
          </div>
        )}

        {noCredits && isDiscovery && (
          <div className="mt-4">
            <p className="text-sm text-muted mb-3">
              Tu as utilisé tes {DISCOVERY_CREDITS} crédits 😔
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors"
            >
              Passer au Pro →
            </Link>
          </div>
        )}

        {noCredits && isPro && (
          <div className="mt-4">
            <p className="text-sm text-muted mb-1">
              Tu as utilisé tes {PRO_CREDITS} crédits ce mois 😔
            </p>
            {resetLabel && (
              <p className="text-sm text-muted mb-3">
                Renouvellement le {resetLabel}
              </p>
            )}
            <button
              type="button"
              onClick={() => setCreditsModalOpen(true)}
              className="inline-block text-[13px] text-[#8B7D6B] border border-[#8B7D6B] px-4 py-2 rounded-lg hover:bg-background transition-colors"
            >
              Racheter des crédits →
            </button>
          </div>
        )}
      </div>

      {isPro && (
        <div className="border-t border-muted/20 pt-6">
          <a
            href="/api/stripe/portal"
            className="inline-block text-[13px] text-[#8B7D6B] border border-[#8B7D6B] px-4 py-2 rounded-lg hover:bg-background transition-colors"
          >
            Gérer mon abonnement
          </a>
        </div>
      )}

      <LogoutButton variant="account" />

      <CreditsPurchaseModal
        open={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
        loading={checkoutLoading}
        onSelectPlan={handleCreditsPurchase}
      />
    </div>
  );
}
