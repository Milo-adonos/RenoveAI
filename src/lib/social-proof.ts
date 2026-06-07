const STORAGE_KEY = "renove_social_proof";

interface StoredProof {
  count: number;
  periodStart: number;
}

function randomCount(): number {
  return Math.floor(Math.random() * (1875 - 824 + 1)) + 824;
}

/** Période courante : commence chaque jour à 15h00 */
export function getCurrentPeriodStart(now = new Date()): Date {
  const periodStart = new Date(now);
  periodStart.setHours(15, 0, 0, 0);

  if (now < periodStart) {
    periodStart.setDate(periodStart.getDate() - 1);
  }

  return periodStart;
}

export function getSocialProofCount(): number {
  if (typeof window === "undefined") return 1247;

  const periodStart = getCurrentPeriodStart();
  const periodStartMs = periodStart.getTime();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored: StoredProof = JSON.parse(raw);
      if (stored.periodStart === periodStartMs && stored.count) {
        return stored.count;
      }
    }
  } catch {
    // ignore corrupted storage
  }

  const count = randomCount();
  const data: StoredProof = { count, periodStart: periodStartMs };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return count;
}
