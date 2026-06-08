import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

export function mapSubscriptionStatus(
  status: Stripe.Subscription.Status
): "active" | "canceled" | "inactive" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "canceled") return "canceled";
  return "inactive";
}

export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): string | null {
  const end = subscription.current_period_end;
  if (!end || Number.isNaN(end)) return null;

  const date = new Date(end * 1000);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

export async function resolveUserIdFromSubscription(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<string | null> {
  const fromMetadata = subscription.metadata?.supabase_user_id;
  if (fromMetadata) return fromMetadata;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  return profile?.id ?? null;
}

export async function syncSubscriptionToProfile(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
  planOverride?: string
): Promise<{ ok: boolean; error?: string }> {
  const userId = await resolveUserIdFromSubscription(supabase, subscription);
  if (!userId) {
    return { ok: false, error: "No user found for subscription" };
  }

  const plan = planOverride || subscription.metadata?.plan || "monthly";

  const updates: Record<string, string | null> = {
    subscription_status: mapSubscriptionStatus(subscription.status),
    subscription_plan: plan,
    subscription_end_date: getSubscriptionPeriodEnd(subscription),
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("[subscription-sync] Update failed:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
