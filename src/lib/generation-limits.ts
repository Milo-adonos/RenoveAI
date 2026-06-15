export const MONTHLY_GENERATION_LIMIT = 30;

export function getNextCalendarMonthStart(from = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1);
}

export function getResetDateIn30Days(from = new Date()): string {
  return new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

export function shouldResetMonthlyGenerations(
  resetDate: string | null | undefined,
  now = new Date()
): boolean {
  if (!resetDate) return true;
  return new Date(resetDate) < now;
}

export type GenerationProfile = {
  subscription_plan: string | null;
  subscription_status: string | null;
  generations_used: number | null;
  generations_reset_date: string | null;
};

export function isYearlyPlan(plan: string | null | undefined): boolean {
  return plan === "yearly" || plan === "annual";
}

export function isMonthlyPlan(plan: string | null | undefined): boolean {
  return plan === "monthly";
}

export function canGenerateWithProfile(
  profile: GenerationProfile,
  used: number
): boolean {
  if (profile.subscription_status !== "active") return false;
  if (isYearlyPlan(profile.subscription_plan)) return true;
  if (isMonthlyPlan(profile.subscription_plan)) {
    return used < MONTHLY_GENERATION_LIMIT;
  }
  return false;
}
