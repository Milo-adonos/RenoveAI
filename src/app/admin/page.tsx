"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface AdminStats {
  generations: number;
  totalUsers: number;
  activeSubscribers: number;
  inactiveSubscribers: number;
  canceledSubscribers: number;
  weeklyActive: number;
  monthlyActive: number;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function StatCard({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-soft ${className}`}
    >
      <p className="font-hero text-[28px] font-bold text-accent leading-tight">
        {value}
      </p>
      <p
        className="mt-1 text-muted"
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: "12px",
        }}
      >
        {label}
      </p>
    </div>
  );
}

async function fetchAdminStats(): Promise<AdminStats> {
  const supabase = createClient();

  const [
    generationsRes,
    profilesRes,
    activeRes,
    inactiveRes,
    canceledRes,
    weeklyActiveRes,
    monthlyActiveRes,
  ] = await Promise.all([
    supabase.from("generations").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "inactive"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "canceled"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active")
      .eq("subscription_plan", "weekly"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active")
      .eq("subscription_plan", "monthly"),
  ]);

  return {
    generations: generationsRes.count ?? 0,
    totalUsers: profilesRes.count ?? 0,
    activeSubscribers: activeRes.count ?? 0,
    inactiveSubscribers: inactiveRes.count ?? 0,
    canceledSubscribers: canceledRes.count ?? 0,
    weeklyActive: weeklyActiveRes.count ?? 0,
    monthlyActive: monthlyActiveRes.count ?? 0,
  };
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const monthlyRevenue = stats
    ? stats.weeklyActive * 4.99 + stats.monthlyActive * 9.99
    : 0;
  const aiCost = stats ? stats.generations * 0.06 : 0;
  const estimatedProfit = monthlyRevenue - aiCost;

  return (
    <main className="min-h-screen bg-background px-5 py-6 max-w-[390px] mx-auto w-full">
      <Link
        href="/"
        className="inline-block text-sm text-muted hover:text-foreground transition-colors mb-8"
      >
        ← Retour au site
      </Link>

      <h1 className="font-hero text-2xl font-bold text-foreground text-center">
        Dashboard Admin
      </h1>
      <p className="text-center text-muted text-sm mt-1">
        Renove AI — accès privé
      </p>

      {loading ? (
        <div className="mt-10 text-center text-muted text-sm animate-pulse">
          Chargement...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-8">
          <StatCard
            value={String(stats?.generations ?? 0)}
            label="Générations"
          />
          <StatCard
            value={String(stats?.totalUsers ?? 0)}
            label="Utilisateurs total"
          />
          <StatCard
            value={String(stats?.activeSubscribers ?? 0)}
            label="Abonnés actifs"
          />
          <StatCard
            value={String(stats?.inactiveSubscribers ?? 0)}
            label="Abonnés inactifs"
          />
          <StatCard
            value={String(stats?.canceledSubscribers ?? 0)}
            label="Abonnés annulés"
          />
          <StatCard
            value={formatEuro(monthlyRevenue)}
            label="CA mensuel estimé"
          />
          <StatCard value={formatEuro(aiCost)} label="Coût IA estimé" />
          <StatCard
            value={formatEuro(estimatedProfit)}
            label="Bénéfice estimé"
            className="col-span-2 bg-[#F0E6DE]"
          />
        </div>
      )}
    </main>
  );
}
