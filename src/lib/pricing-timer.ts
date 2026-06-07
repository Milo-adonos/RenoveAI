const TIMER_KEY = "renove_pricing_timer_end";
const TIMER_DURATION_MS = 24 * 60 * 60 * 1000;

export function getPricingTimerEnd(): number {
  if (typeof window === "undefined") return Date.now() + TIMER_DURATION_MS;

  const stored = localStorage.getItem(TIMER_KEY);
  const now = Date.now();

  if (stored) {
    const end = Number(stored);
    if (!Number.isNaN(end) && end > now) return end;
  }

  const newEnd = now + TIMER_DURATION_MS;
  localStorage.setItem(TIMER_KEY, String(newEnd));
  return newEnd;
}

export function formatPricingTimer(remainingMs: number): string {
  const totalMin = Math.max(0, Math.ceil(remainingMs / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function isPricingTimerExpired(remainingMs: number): boolean {
  return remainingMs <= 0;
}
