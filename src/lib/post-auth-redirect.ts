import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileRedirectInfo = {
  subscription_status: string | null;
  stripe_customer_id: string | null;
};

export async function resolvePostAuthRedirectPath(
  supabase: SupabaseClient,
  userId: string,
  options?: { selectedPlan?: string | null }
): Promise<string> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("subscription_status, stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[post-auth-redirect] profile fetch error:", error.message);
  }

  if (profile?.subscription_status === "active") {
    return "/dashboard";
  }

  const plan = options?.selectedPlan;
  if (plan === "monthly" || plan === "yearly") {
    return `/api/stripe/checkout?plan=${plan}`;
  }

  if (shouldRedirectToPricing(profile)) {
    return "/pricing";
  }

  return "/upload";
}

function shouldRedirectToPricing(profile: ProfileRedirectInfo | null): boolean {
  if (!profile) return false;

  if (profile.subscription_status === "canceled") {
    return true;
  }

  // Former subscriber (payment failed / past_due) — not a new funnel user
  if (
    profile.subscription_status === "inactive" &&
    profile.stripe_customer_id
  ) {
    return true;
  }

  return false;
}
