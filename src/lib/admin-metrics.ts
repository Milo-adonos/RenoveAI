export const AI_COST_PER_GENERATION = 0.08;
export const MONTHLY_PLAN_PRICE = 9.99;
export const WEEKLY_PLAN_MONTHLY_EQUIVALENT = 21.62;

export type AdminTab =
  | "overview"
  | "users"
  | "generations"
  | "finances"
  | "settings";

export function computeUserRevenue(
  status: string | null,
  plan: string | null
): number {
  if (status !== "active") return 0;
  if (plan === "weekly") return WEEKLY_PLAN_MONTHLY_EQUIVALENT;
  if (plan === "monthly") return MONTHLY_PLAN_PRICE;
  return 0;
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRelativeTime(date: string | null): string {
  if (!date) return "—";

  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const months = Math.floor(days / 30);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 30) return `il y a ${days}j`;
  if (months < 12) return `il y a ${months}m`;
  return `il y a ${Math.floor(months / 12)}a`;
}

export function formatAdminDate(date = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getLast30DayKeys(): string[] {
  const keys: string[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    keys.push(day.toISOString().slice(0, 10));
  }
  return keys;
}

export function groupCountByDay(
  items: { created_at: string }[],
  dayKeys = getLast30DayKeys()
): { date: string; count: number }[] {
  const counts = new Map(dayKeys.map((date) => [date, 0]));

  for (const item of items) {
    const key = item.created_at.slice(0, 10);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return dayKeys.map((date) => ({
    date,
    count: counts.get(date) ?? 0,
  }));
}

export function estimateDailyRevenue(
  dailyGenerations: { date: string; count: number }[],
  estimatedMRR: number
): { date: string; amount: number }[] {
  const totalGenerations = dailyGenerations.reduce(
    (sum, day) => sum + day.count,
    0
  );

  if (totalGenerations === 0) {
    const flatDaily = estimatedMRR / 30;
    return dailyGenerations.map((day) => ({
      date: day.date,
      amount: Math.round(flatDaily * 100) / 100,
    }));
  }

  return dailyGenerations.map((day) => ({
    date: day.date,
    amount:
      Math.round(((day.count / totalGenerations) * estimatedMRR) * 100) / 100,
  }));
}

export function shortChartLabel(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}-${month}`;
}
