export const DISCOVERY_CREDITS = 5;
export const PRO_CREDITS = 20;
export const LEGACY_MONTHLY_CREDITS = 30;
export const CREDITS_PACK_5 = 5;
export const CREDITS_PACK_15 = 15;
export const YEARLY_UNLIMITED_CREDITS = 9999;

export type PaidSubscriptionPlan =
  | "discovery"
  | "pro"
  | "monthly"
  | "yearly"
  | "weekly";

export type CreditsProfile = {
  credits_balance: number | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  credits_reset_date: string | null;
};

export function isYearlyPlan(plan: string | null | undefined): boolean {
  return plan === "yearly" || plan === "annual";
}

export function isLegacyMonthlyPlan(plan: string | null | undefined): boolean {
  return plan === "monthly";
}

export function isLegacyWeeklyPlan(plan: string | null | undefined): boolean {
  return plan === "weekly";
}

export function isProPlan(plan: string | null | undefined): boolean {
  return plan === "pro";
}

export function isDiscoveryPlan(plan: string | null | undefined): boolean {
  return plan === "discovery";
}

export function hasDashboardAccess(
  subscriptionStatus: string | null | undefined,
  subscriptionPlan: string | null | undefined
): boolean {
  if (subscriptionStatus !== "active") return false;

  return (
    isDiscoveryPlan(subscriptionPlan) ||
    isProPlan(subscriptionPlan) ||
    isLegacyMonthlyPlan(subscriptionPlan) ||
    isYearlyPlan(subscriptionPlan) ||
    isLegacyWeeklyPlan(subscriptionPlan)
  );
}

export function getPlanCreditLimit(plan: string | null | undefined): number | null {
  if (isDiscoveryPlan(plan)) return DISCOVERY_CREDITS;
  if (isProPlan(plan)) return PRO_CREDITS;
  if (isLegacyMonthlyPlan(plan)) return LEGACY_MONTHLY_CREDITS;
  if (isLegacyWeeklyPlan(plan)) return 20;
  if (isYearlyPlan(plan)) return null;
  return 0;
}

export function getInitialCreditsForPlan(plan: string): number {
  switch (plan) {
    case "discovery":
      return DISCOVERY_CREDITS;
    case "pro":
      return PRO_CREDITS;
    case "monthly":
      return LEGACY_MONTHLY_CREDITS;
    case "yearly":
    case "annual":
      return YEARLY_UNLIMITED_CREDITS;
    case "weekly":
      return 20;
    case "credits_5":
      return CREDITS_PACK_5;
    case "credits_15":
      return CREDITS_PACK_15;
    default:
      return 0;
  }
}

export function getCreditsForCheckoutPlan(plan: string): number {
  return getInitialCreditsForPlan(plan);
}

export function getCreditsResetDateIn30Days(from = new Date()): string {
  return new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

export function shouldResetCreditsOnSchedule(
  creditsResetDate: string | null | undefined,
  plan: string | null | undefined
): boolean {
  if (!creditsResetDate) return false;
  if (isYearlyPlan(plan)) return false;
  if (
    !isProPlan(plan) &&
    !isLegacyMonthlyPlan(plan) &&
    !isLegacyWeeklyPlan(plan)
  ) {
    return false;
  }
  return new Date(creditsResetDate) < new Date();
}

export function canGenerateWithCredits(profile: CreditsProfile): boolean {
  if (profile.subscription_status !== "active") return false;
  if (!hasDashboardAccess(profile.subscription_status, profile.subscription_plan)) {
    return false;
  }
  if (isYearlyPlan(profile.subscription_plan)) return true;
  return (profile.credits_balance ?? 0) > 0;
}

export function shouldDebitCredits(plan: string | null | undefined): boolean {
  return !isYearlyPlan(plan);
}

export function getCreditsUsed(profile: CreditsProfile): number {
  const limit = getPlanCreditLimit(profile.subscription_plan);
  if (limit === null) return 0;
  const remaining = profile.credits_balance ?? 0;
  return Math.max(0, limit - remaining);
}

export function getCreditsProgress(profile: CreditsProfile): number {
  const limit = getPlanCreditLimit(profile.subscription_plan);
  if (limit === null || limit <= 0) return 0;
  const remaining = profile.credits_balance ?? 0;
  return Math.min(100, ((limit - remaining) / limit) * 100);
}

export function getPlanDisplayName(plan: string | null | undefined): string {
  if (isDiscoveryPlan(plan)) return "Découverte — 4,90€";
  if (isProPlan(plan)) return "Pro — 12,99€/mois";
  if (isLegacyMonthlyPlan(plan)) return "Mensuel — 9,99€/mois";
  if (isYearlyPlan(plan)) return "Annuel — 49,90€/an";
  if (isLegacyWeeklyPlan(plan)) return "Hebdomadaire";
  return "Inactif";
}
