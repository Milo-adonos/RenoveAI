const WEEKLY_LIMIT = 20;

export function getLastMonday(): Date {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay();
  const diff = day === 0 ? 6 : day - 1;
  monday.setDate(monday.getDate() - diff);
  return monday;
}

export function getNextMonday(): Date {
  const lastMonday = getLastMonday();
  const next = new Date(lastMonday);
  next.setDate(next.getDate() + 7);
  return next;
}

export function shouldResetWeeklyCounter(
  weeklyResetDate: string | null | undefined
): boolean {
  if (!weeklyResetDate) return true;
  return new Date(weeklyResetDate) < getLastMonday();
}

export function getWeeklyLimitInfo(used: number) {
  return {
    limit: WEEKLY_LIMIT,
    used,
    remaining: Math.max(0, WEEKLY_LIMIT - used),
  };
}

export { WEEKLY_LIMIT };
