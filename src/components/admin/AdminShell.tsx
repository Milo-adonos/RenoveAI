"use client";

import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Palette,
  RefreshCw,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type { AdminTab } from "@/lib/admin-metrics";

const NAV_ITEMS: {
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "generations", label: "Générations", icon: Palette },
  { id: "finances", label: "Finances", icon: Wallet },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <p className="admin-brand-title">Renove AI</p>
        <p className="admin-brand-subtitle">ADMIN</p>
      </div>

      <nav className="admin-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`admin-nav-item ${activeTab === id ? "admin-nav-item-active" : ""}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <Link href="/" className="admin-logout">
        <LogOut className="w-4 h-4 shrink-0" />
        <span>Retour au site</span>
      </Link>
    </aside>
  );
}

export function AdminTopBar({
  title,
  subtitle,
  lastUpdated,
  loading,
  onRefresh,
}: {
  title: string;
  subtitle?: string;
  lastUpdated: string | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="admin-topbar">
      <div>
        <h1 className="admin-page-title">{title}</h1>
        {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      </div>

      <div className="admin-topbar-actions">
        <div className="admin-live-badge">
          <span className="admin-live-dot" />
          <span>
            {lastUpdated
              ? `MAJ ${formatUpdateTime(lastUpdated)}`
              : "Chargement..."}
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="admin-refresh-btn"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Rafraîchir
        </button>
      </div>
    </div>
  );
}

function formatUpdateTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  if (seconds < 60) return `il y a ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `il y a ${minutes} min`;
}

export function KpiCard({
  label,
  value,
  subtext,
  tone = "default",
  icon: Icon = BarChart3,
}: {
  label: string;
  value: string;
  subtext: string;
  tone?: "default" | "accent" | "green" | "blue" | "purple" | "red";
  icon?: typeof BarChart3;
}) {
  return (
    <div className="admin-kpi-card">
      <div className={`admin-kpi-label admin-kpi-label-${tone}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="admin-kpi-value">{value}</p>
      <p className="admin-kpi-subtext">{subtext}</p>
    </div>
  );
}
