#!/usr/bin/env node
/**
 * Crée / met à jour le funnel Renove AI dans PostHog.
 *
 * Usage:
 *   POSTHOG_PERSONAL_API_KEY=phx_xxx node scripts/setup-posthog-pageview-funnel.mjs
 */

const API_HOST = process.env.POSTHOG_API_HOST || "https://eu.posthog.com";
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const DASHBOARD_NAME = "Renove AI — Conversion";
/** Projet Renove AI (pas GoMytho 154997) — clé phc_D5UxUfUF... */
const RENOVE_API_TOKEN =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "phc_D5UxUfUFqb37rfmz3UQAzq3sH5zyt8YUncRwvkxNfutz";

const PAGEVIEW_FUNNEL_NAME =
  "Funnel Renove AI — du Landing à la 1ère création";
const PAGEVIEW_FUNNEL_DESCRIPTION =
  "Conversion à chaque étape : Landing → Signup → Upload photo → Chargement → Choix offre → Mes créations";

/** Events funnel explicites (plus fiables que pageview + pathname) */
const FUNNEL_STEPS = [
  { name: "Landing", event: "funnel_landing" },
  { name: "Signup", event: "funnel_signup" },
  { name: "Upload photo", event: "funnel_upload" },
  { name: "Chargement", event: "funnel_loading" },
  { name: "Choix offre", event: "funnel_pricing" },
  { name: "Mes créations", event: "funnel_creations" },
];

function funnelSeries(steps) {
  return steps.map(({ name, event }) => ({
    kind: "EventsNode",
    event,
    custom_name: name,
  }));
}

async function getProjectId() {
  if (process.env.POSTHOG_PROJECT_ID) {
    return Number(process.env.POSTHOG_PROJECT_ID);
  }

  const projects = await api("/api/projects/");
  const list = projects.results || projects;
  const renove = list.find((p) => p.api_token === RENOVE_API_TOKEN);

  if (!renove) {
    throw new Error(
      "Projet Renove AI introuvable. Vérifie NEXT_PUBLIC_POSTHOG_KEY ou POSTHOG_PROJECT_ID=198113"
    );
  }

  return renove.id;
}

async function api(path, options = {}) {
  const res = await fetch(`${API_HOST}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(
      `PostHog API ${options.method || "GET"} ${path} → ${res.status}: ${JSON.stringify(data)}`
    );
  }

  return data;
}

async function getDashboardId(projectId) {
  const dashboards = await api(`/api/projects/${projectId}/dashboards/`);
  const list = dashboards.results || dashboards;
  const dashboard = list.find((d) => d.name === DASHBOARD_NAME);
  return dashboard?.id ?? null;
}

async function findExistingInsight(projectId) {
  const insights = await api(
    `/api/projects/${projectId}/insights/?search=${encodeURIComponent(PAGEVIEW_FUNNEL_NAME)}`
  );
  const list = insights.results || insights;
  return list.find((i) => i.name === PAGEVIEW_FUNNEL_NAME);
}

async function main() {
  if (!API_KEY?.startsWith("phx_")) {
    console.error("❌ POSTHOG_PERSONAL_API_KEY manquante (phx_...)");
    process.exit(1);
  }

  const projectId = await getProjectId();
  const dashboardId = await getDashboardId(projectId);

  const payload = {
    name: PAGEVIEW_FUNNEL_NAME,
    description: PAGEVIEW_FUNNEL_DESCRIPTION,
    ...(dashboardId ? { dashboards: [dashboardId] } : {}),
    query: {
      kind: "InsightVizNode",
      source: {
        kind: "FunnelsQuery",
        series: funnelSeries(FUNNEL_STEPS),
        dateRange: { date_from: "-30d" },
        funnelsFilter: {
          funnelWindowInterval: 7,
          funnelWindowIntervalUnit: "day",
          funnelOrderType: "ordered",
        },
      },
    },
  };

  const existing = await findExistingInsight(projectId);
  let insight;

  if (existing) {
    insight = await api(`/api/projects/${projectId}/insights/${existing.id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    console.log(`Funnel mis à jour (id: ${insight.id})`);
  } else {
    insight = await api(`/api/projects/${projectId}/insights/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`Funnel créé (id: ${insight.id})`);
  }

  console.log(`
✅ ${PAGEVIEW_FUNNEL_NAME}

Étapes (projet Renove AI uniquement):
${FUNNEL_STEPS.map((s, i) => `  ${i + 1}. ${s.name} → ${s.event}`).join("\n")}

Ouvre l'insight:
${API_HOST}/project/${projectId}/insights/${insight.short_id || insight.id}
${dashboardId ? `\nDashboard:\n${API_HOST}/project/${projectId}/dashboard/${dashboardId}` : ""}
`);
}

main().catch((err) => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
