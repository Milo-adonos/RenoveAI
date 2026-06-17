export const DISCOVERY_CREDITS = 5;
export const PRO_CREDITS = 20;
export const CREDITS_PACK_5 = 5;
export const CREDITS_PACK_15 = 15;

export type ActiveSubscriptionPlan = "discovery" | "pro";

export type CreditsProfile = {
  credits_balance: number | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  credits_reset_date: string | null;
};

export function getPlanCreditLimit(plan: string | null | undefined): number {
  if (plan === "discovery") return DISCOVERY_CREDITS;
  if (plan === "pro") return PRO_CREDITS;
  return 0;
}

export function getCreditsForCheckoutPlan(plan: string): number {
  switch (plan) {
    case "discovery":
      return DISCOVERY_CREDITS;
    case "pro":
      return PRO_CREDITS;
    case "credits_5":
      return CREDITS_PACK_5;
    case "credits_15":
      return CREDITS_PACK_15;
    default:
      return 0;
  }
}

export function getCreditsResetDateIn30Days(from = new Date()): string {
  return new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

export function isActiveSubscriptionPlan(
  plan: string | null | undefined
): plan is ActiveSubscriptionPlan {
  return plan === "discovery" || plan === "pro";
}

export function shouldResetProCredits(
  creditsResetDate: string | null | undefined,
  plan: string | null | undefined
): boolean {
  if (plan !== "pro" || !creditsResetDate) return false;
  return new Date(creditsResetDate) < new Date();
}

export function canGenerateWithCredits(profile: CreditsProfile): boolean {
  if (profile.subscription_status !== "active") return false;
  if (!isActiveSubscriptionPlan(profile.subscription_plan)) return false;
  return (profile.credits_balance ?? 0) > 0;
}

export function getCreditsUsed(profile: CreditsProfile): number {
  const limit = getPlanCreditLimit(profile.subscription_plan);
  const remaining = profile.credits_balance ?? 0;
  return Math.max(0, limit - remaining);
}

export function getCreditsProgress(profile: CreditsProfile): number {
  const limit = getPlanCreditLimit(profile.subscription_plan);
  if (limit <= 0) return 0;
  const remaining = profile.credits_balance ?? 0;
  return Math.min(100, ((limit - remaining) / limit) * 100);
}
