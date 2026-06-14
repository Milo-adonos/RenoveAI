#!/usr/bin/env node
/**
 * Crée le dashboard "Renove AI — Conversion" dans PostHog (EU).
 *
 * Usage:
 *   POSTHOG_PERSONAL_API_KEY=phx_xxx node scripts/setup-posthog-dashboard.mjs
 *
 * Clé à récupérer dans PostHog → Settings → Personal API keys
 */

const API_HOST = process.env.POSTHOG_API_HOST || "https://eu.posthog.com";
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const RENOVE_API_TOKEN =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "phc_D5UxUfUFqb37rfmz3UQAzq3sH5zyt8YUncRwvkxNfutz";

const DASHBOARD_NAME = "Renove AI — Conversion";
const DASHBOARD_DESCRIPTION =
  "Funnel de conversion Renove AI — landing → signup → upload → loading → pricing → paiement";

const MAIN_FUNNEL = [
  ["funnel_landing", "Landing"],
  ["funnel_signup", "Signup"],
  ["funnel_upload", "Upload"],
  ["funnel_generation_started", "Génération lancée"],
  ["funnel_loading", "Loading"],
  ["funnel_pricing", "Pricing"],
  ["funnel_unlock_clicked", "Clic débloquer"],
  ["funnel_plan_selected", "Plan choisi"],
  ["funnel_payment_completed", "Paiement"],
  ["funnel_creations", "Mes créations"],
];

const PAYWALL_FUNNEL = [
  ["funnel_pricing", "Pricing"],
  ["funnel_unlock_clicked", "Clic débloquer"],
  ["funnel_plan_selected", "Plan choisi"],
  ["funnel_signup", "Signup checkout"],
  ["funnel_payment_completed", "Paiement"],
];

const GENERATION_FUNNEL = [
  ["funnel_generation_started", "Photo envoyée"],
  ["funnel_loading", "Loading"],
  ["funnel_pricing", "Pricing"],
  ["funnel_payment_completed", "Paiement"],
  ["funnel_creations", "Création affichée"],
];

function funnelSeries(steps) {
  return steps.map(([event, name]) => ({
    kind: "EventsNode",
    event,
    custom_name: name,
  }));
}

function funnelInsight(name, description, steps, dashboardId) {
  return {
    name,
    description,
    dashboards: [dashboardId],
    query: {
      kind: "InsightVizNode",
      source: {
        kind: "FunnelsQuery",
        series: funnelSeries(steps),
        dateRange: { date_from: "-30d" },
        funnelsFilter: {
          funnelWindowInterval: 7,
          funnelWindowIntervalUnit: "day",
          funnelOrderType: "ordered",
        },
      },
    },
  };
}

function trendsInsight(name, description, events, dashboardId, breakdown) {
  const source = {
    kind: "TrendsQuery",
    series: events.map((event) => ({
      kind: "EventsNode",
      event,
      name: event,
      math: "total",
    })),
    interval: "day",
    dateRange: { date_from: "-30d" },
  };

  if (breakdown) {
    source.breakdownFilter = {
      breakdowns: [
        {
          property: breakdown,
          type: "event",
        },
      ],
    };
  }

  return {
    name,
    description,
    dashboards: [dashboardId],
    query: {
      kind: "InsightVizNode",
      source,
    },
  };
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

async function getProjectId() {
  if (process.env.POSTHOG_PROJECT_ID) {
    return Number(process.env.POSTHOG_PROJECT_ID);
  }

  const projects = await api("/api/projects/");
  const list = projects.results || projects;

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Aucun projet PostHog trouvé sur ce compte.");
  }

  const renove = list.find((p) => p.api_token === RENOVE_API_TOKEN);
  if (renove) return renove.id;

  throw new Error(
    "Projet Renove AI introuvable. Vérifie NEXT_PUBLIC_POSTHOG_KEY ou POSTHOG_PROJECT_ID=198113"
  );
}

async function findExistingDashboard(projectId) {
  const dashboards = await api(`/api/projects/${projectId}/dashboards/`);
  const list = dashboards.results || dashboards;
  return list.find((d) => d.name === DASHBOARD_NAME);
}

async function createDashboard(projectId) {
  const existing = await findExistingDashboard(projectId);
  if (existing) {
    console.log(`Dashboard existant trouvé (id: ${existing.id}) — mise à jour des insights.`);
    return existing.id;
  }

  const dashboard = await api(`/api/projects/${projectId}/dashboards/`, {
    method: "POST",
    body: JSON.stringify({
      name: DASHBOARD_NAME,
      description: DASHBOARD_DESCRIPTION,
      pinned: true,
      tags: ["renove-ai", "conversion"],
    }),
  });

  console.log(`Dashboard créé (id: ${dashboard.id})`);
  return dashboard.id;
}

async function createInsight(projectId, payload) {
  const insight = await api(`/api/projects/${projectId}/insights/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log(`  ✓ ${payload.name}`);
  return insight;
}

async function main() {
  if (!API_KEY?.startsWith("phx_")) {
    console.error(`
❌ Clé personnelle PostHog manquante ou invalide.

1. Va sur https://eu.posthog.com/settings/user-api-keys
2. Crée une clé avec les scopes: insight:write, dashboard:write, project:read
3. Lance:

   POSTHOG_PERSONAL_API_KEY=phx_ta_cle node scripts/setup-posthog-dashboard.mjs
`);
    process.exit(1);
  }

  console.log("Connexion à PostHog EU…");
  const projectId = await getProjectId();
  console.log(`Projet ID: ${projectId}`);

  const dashboardId = await createDashboard(projectId);

  const insights = [
    funnelInsight(
      "Funnel conversion complet",
      "Parcours landing → signup → upload → pricing → paiement (7 jours)",
      MAIN_FUNNEL,
      dashboardId
    ),
    funnelInsight(
      "Taux de conversion génération → paiement",
      "Upload → loading → pricing → paiement → création",
      GENERATION_FUNNEL,
      dashboardId
    ),
    funnelInsight(
      "Funnel paywall → paiement",
      "Pricing → déblocage → signup checkout → paiement",
      PAYWALL_FUNNEL,
      dashboardId
    ),
    trendsInsight(
      "Trafic quotidien",
      "Pages vues et visites landing",
      ["$pageview", "funnel_landing"],
      dashboardId
    ),
    trendsInsight(
      "Styles utilisés",
      "Styles choisis lors des générations",
      ["funnel_generation_started"],
      dashboardId,
      "style"
    ),
    trendsInsight(
      "Erreurs de génération",
      "Échecs de génération par jour",
      ["funnel_generation_failed"],
      dashboardId
    ),
  ];

  console.log("\nCréation des insights…");
  for (const insight of insights) {
    await createInsight(projectId, insight);
  }

  console.log(`
✅ Terminé !

Ouvre ton dashboard ici:
${API_HOST}/project/${projectId}/dashboard/${dashboardId}
`);
}

main().catch((err) => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
