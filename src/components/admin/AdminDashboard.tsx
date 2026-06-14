"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Activity,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { AdminBarChart, AdminLineChart } from "@/components/admin/AdminCharts";
import {
  AdminSidebar,
  AdminTopBar,
  KpiCard,
} from "@/components/admin/AdminShell";
import {
  type AdminTab,
  formatAdminDate,
  formatEuro,
  formatRelativeTime,
} from "@/lib/admin-metrics";
import type { AdminGeneration, AdminStats, AdminUser } from "@/types/admin";

function planLabel(plan: string | null): string {
  if (plan === "weekly") return "Hebdo";
  if (plan === "monthly") return "Mensuel";
  return "—";
}

function statusClass(status: string | null): string {
  if (status === "active") return "admin-status-active";
  if (status === "canceled") return "admin-status-canceled";
  return "admin-status-inactive";
}

function statusLabel(status: string | null): string {
  if (status === "active") return "active";
  if (status === "canceled") return "cancelled";
  return status ?? "inactive";
}

function generationLabel(generation: AdminGeneration): string {
  if (generation.custom_prompt?.trim()) return generation.custom_prompt.trim();
  if (generation.style?.trim()) return generation.style.trim();
  return "Rendu généré";
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [generations, setGenerations] = useState<AdminGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "weekly" | "monthly">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "canceled"
  >("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, usersRes, generationsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/generations"),
      ]);

      if (!statsRes.ok || !usersRes.ok || !generationsRes.ok) {
        throw new Error("Impossible de charger les données admin");
      }

      const [statsData, usersData, generationsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        generationsRes.json(),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setGenerations(generationsData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Erreur de chargement"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        (user.email?.toLowerCase().includes(query) ?? false) ||
        (user.full_name?.toLowerCase().includes(query) ?? false);
      const matchesPlan =
        planFilter === "all" || user.subscription_plan === planFilter;
      const matchesStatus =
        statusFilter === "all" || user.subscription_status === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [planFilter, statusFilter, userSearch, users]);

  const revenueChartData =
    stats?.dailyRevenue.map((point) => ({
      date: point.date,
      value: point.amount,
    })) ?? [];

  const generationsChartData =
    stats?.dailyGenerations.map((point) => ({
      date: point.date,
      value: point.count,
    })) ?? [];

  const pageTitle =
    activeTab === "overview"
      ? "Vue d'ensemble"
      : activeTab === "users"
        ? `Utilisateurs (${users.length})`
        : activeTab === "generations"
          ? `Générations (${stats?.totalGenerations ?? 0})`
          : activeTab === "finances"
            ? "Finances"
            : "Paramètres";

  const pageSubtitle =
    activeTab === "overview"
      ? formatAdminDate()
      : activeTab === "generations"
        ? "Historique des rendus générés sur la plateforme"
        : undefined;

  return (
    <div className="admin-app">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="admin-main">
        <AdminTopBar
          title={pageTitle}
          subtitle={pageSubtitle}
          lastUpdated={stats?.lastUpdated ?? null}
          loading={loading}
          onRefresh={loadData}
        />

        {error ? (
          <div className="admin-error">{error}</div>
        ) : loading && !stats ? (
          <div className="admin-loading">Chargement du dashboard...</div>
        ) : (
          <>
            {activeTab === "overview" && stats && (
              <div className="admin-panel">
                <div className="admin-kpi-grid">
                  <KpiCard
                    label="CA ENCAISSÉ"
                    value={formatEuro(stats.actualRevenue)}
                    subtext={`+${formatEuro(stats.actualRevenue30d)} ces 30 jours · Estimé/mois : ${formatEuro(stats.estimatedMRR)} si personne n'annule`}
                    tone="green"
                    icon={Wallet}
                  />
                  <KpiCard
                    label="BÉNÉFICE NET"
                    value={formatEuro(stats.actualProfit)}
                    subtext={`Marge réelle : ${stats.actualMarginPercent}% · Estimé/mois : ${formatEuro(stats.estimatedProfit)} si personne n'annule`}
                    tone="green"
                    icon={TrendingUp}
                  />
                  <KpiCard
                    label="COÛT IA"
                    value={formatEuro(stats.estimatedAICost)}
                    subtext={`${stats.totalGenerations} générations`}
                    tone="accent"
                    icon={Activity}
                  />
                  <KpiCard
                    label="ABONNÉS ACTIFS"
                    value={String(stats.activeSubscribers)}
                    subtext={`${stats.weeklySubscribers} hebdo · ${stats.monthlySubscribers} mensuel`}
                    tone="blue"
                    icon={Users}
                  />
                  <KpiCard
                    label="TOTAL ABONNÉS"
                    value={String(stats.totalUsers)}
                    subtext={`${stats.activeSubscribers} actifs · ${stats.canceledSubscribers} annulés`}
                    tone="purple"
                    icon={Trophy}
                  />
                  <KpiCard
                    label="NOUVEAUX (30J)"
                    value={`+${stats.newUsers30d}`}
                    subtext="Inscriptions sur 30 jours"
                    tone="green"
                    icon={Sparkles}
                  />
                  <KpiCard
                    label="CHURN (30J)"
                    value={`${stats.churnRate30d}%`}
                    subtext={`${stats.canceledLast30d} annulations ce mois`}
                    tone="red"
                    icon={TrendingDown}
                  />
                </div>

                <div className="admin-charts-grid">
                  <div className="admin-chart-card">
                    <h2>Revenus encaissés (30j)</h2>
                    <AdminLineChart data={revenueChartData} />
                  </div>
                  <div className="admin-chart-card">
                    <h2>Générations (30j)</h2>
                    <AdminBarChart
                      data={generationsChartData}
                      color="#C4724A"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="admin-panel">
                <div className="admin-toolbar">
                  <input
                    type="search"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Rechercher un email..."
                    className="admin-input"
                  />
                  <div className="admin-filter-row">
                    {[
                      { id: "all", label: "Tous" },
                      { id: "weekly", label: "Hebdo" },
                      { id: "monthly", label: "Mensuel" },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() =>
                          setPlanFilter(filter.id as typeof planFilter)
                        }
                        className={`admin-filter-pill ${
                          planFilter === filter.id
                            ? "admin-filter-pill-active"
                            : ""
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="admin-filter-row">
                    {[
                      { id: "all", label: "Tous statuts" },
                      { id: "active", label: "Actif" },
                      { id: "canceled", label: "Annulé" },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() =>
                          setStatusFilter(filter.id as typeof statusFilter)
                        }
                        className={`admin-filter-pill ${
                          statusFilter === filter.id
                            ? "admin-filter-pill-active"
                            : ""
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>EMAIL</th>
                        <th>PLAN</th>
                        <th>STATUT</th>
                        <th>INSCRIPTION</th>
                        <th>GÉNÉR.</th>
                        <th>COÛT IA</th>
                        <th>CA ENCAISSÉ</th>
                        <th>NET</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="admin-table-email">
                            {user.email ?? "—"}
                          </td>
                          <td>{planLabel(user.subscription_plan)}</td>
                          <td>
                            <span
                              className={`admin-status-badge ${statusClass(user.subscription_status)}`}
                            >
                              {statusLabel(user.subscription_status)}
                            </span>
                          </td>
                          <td>{formatRelativeTime(user.created_at)}</td>
                          <td>{user.generationsCount}</td>
                          <td className="admin-table-cost">
                            {formatEuro(user.aiCost)}
                          </td>
                          <td>{formatEuro(user.revenue)}</td>
                          <td
                            className={
                              user.net >= 0
                                ? "admin-table-positive"
                                : "admin-table-negative"
                            }
                          >
                            {user.net >= 0 ? "+" : ""}
                            {formatEuro(user.net)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "generations" && (
              <div className="admin-panel">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>APERÇU</th>
                        <th>UTILISATEUR</th>
                        <th>STYLE / PROMPT</th>
                        <th>DATE</th>
                        <th>COÛT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generations.map((generation) => (
                        <tr key={generation.id}>
                          <td>
                            <div className="admin-thumb">
                              <Image
                                src={generation.generated_image_url}
                                alt="Aperçu"
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover"
                                unoptimized
                              />
                            </div>
                          </td>
                          <td className="admin-table-email">
                            {generation.email ?? "Anonyme"}
                          </td>
                          <td className="admin-table-prompt">
                            {generationLabel(generation)}
                          </td>
                          <td>{formatRelativeTime(generation.created_at)}</td>
                          <td className="admin-table-cost">
                            {formatEuro(generation.aiCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "finances" && stats && (
              <div className="admin-panel admin-finance-grid">
                <div className="admin-finance-card">
                  <p className="admin-finance-label">CA encaissé</p>
                  <p className="admin-finance-value">
                    {formatEuro(stats.actualRevenue)}
                  </p>
                  <p className="admin-finance-sub">
                    +{formatEuro(stats.actualRevenue30d)} ces 30 jours via Stripe
                  </p>
                </div>
                <div className="admin-finance-card admin-finance-card-highlight">
                  <p className="admin-finance-label">CA mensuel estimé</p>
                  <p className="admin-finance-value accent">
                    {formatEuro(stats.estimatedMRR)}
                  </p>
                  <p className="admin-finance-sub">
                    Si personne n&apos;annule · (monthly × 9,99€) + (weekly ×
                    21,62€/mois)
                  </p>
                </div>
                <div className="admin-finance-card">
                  <p className="admin-finance-label">Coût IA estimé</p>
                  <p className="admin-finance-value">
                    {formatEuro(stats.estimatedAICost)}
                  </p>
                  <p className="admin-finance-sub">
                    {stats.totalGenerations} × 0,08€
                  </p>
                </div>
                <div
                  className={`admin-finance-card ${
                    stats.actualProfit >= 0
                      ? "admin-finance-card-positive"
                      : "admin-finance-card-negative"
                  }`}
                >
                  <p className="admin-finance-label">Bénéfice net réel</p>
                  <p
                    className={`admin-finance-value ${
                      stats.actualProfit >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {formatEuro(stats.actualProfit)}
                  </p>
                  <p className="admin-finance-sub">
                    Marge réelle {stats.actualMarginPercent}% · CA encaissé −
                    coût IA
                  </p>
                </div>
                <div
                  className={`admin-finance-card ${
                    stats.estimatedProfit >= 0
                      ? "admin-finance-card-positive"
                      : "admin-finance-card-negative"
                  }`}
                >
                  <p className="admin-finance-label">
                    Bénéfice estimé ce mois
                  </p>
                  <p
                    className={`admin-finance-value ${
                      stats.estimatedProfit >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {formatEuro(stats.estimatedProfit)}
                  </p>
                  <p className="admin-finance-sub">
                    Si personne n&apos;annule · marge estimée{" "}
                    {stats.estimatedMarginPercent}%
                  </p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="admin-panel">
                <div className="admin-settings-card">
                  <h2>Paramètres admin</h2>
                  <p>
                    Dashboard privé Renove AI. Les données sont chargées via les
                    routes API admin avec la clé service Supabase.
                  </p>
                  <ul>
                    <li>Coût IA par génération : 0,08€</li>
                    <li>Plan mensuel : 9,99€</li>
                    <li>Plan hebdo : 21,62€/mois estimé</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
