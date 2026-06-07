"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-green-100 text-green-700" },
  trialing: { label: "Essai gratuit", color: "bg-orange-100 text-orange-700" },
  inactive: { label: "Inactif", color: "bg-red-100 text-red-700" },
  canceled: { label: "Annulé", color: "bg-red-100 text-red-700" },
};

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
      setLoading(false);
    }

    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <div className="animate-pulse text-muted">Chargement...</div>;
  }

  const status = statusLabels[profile?.subscription_status || "inactive"];

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl font-bold mb-8">Mon compte</h1>

      {/* Profile */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Profil</h2>
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Avatar"
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xl">
              {profile?.full_name?.[0] || "?"}
            </div>
          )}
          <div>
            <p className="font-medium">{profile?.full_name || "Utilisateur"}</p>
            <p className="text-sm text-muted">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Abonnement</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted">Plan actuel</span>
            <span className="font-medium">
              {profile?.subscription_plan === "monthly"
                ? "Mensuel — 9,99€/mois"
                : "Hebdomadaire — 4,99€/semaine"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted">Statut</span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}
            >
              {status.label}
            </span>
          </div>
          {profile?.subscription_end_date && (
            <div className="flex justify-between items-center">
              <span className="text-muted">Prochain renouvellement</span>
              <span className="text-sm">
                {new Date(profile.subscription_end_date).toLocaleDateString(
                  "fr-FR"
                )}
              </span>
            </div>
          )}
        </div>
        <a
          href="/api/stripe/portal"
          className="btn-primary mt-6 inline-block text-center"
        >
          Gérer mon abonnement
        </a>
      </div>

      <button onClick={handleLogout} className="btn-outline w-full">
        Se déconnecter
      </button>
    </div>
  );
}
