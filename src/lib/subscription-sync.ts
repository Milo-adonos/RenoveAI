import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

export function normalizeSubscriptionPlan(
  plan: string | null | undefined
): "monthly" | "yearly" {
  if (plan === "yearly" || plan === "annual") return "yearly";
  return "monthly";
}

export function mapSubscriptionStatus(
  status: Stripe.Subscription.Status
): "active" | "canceled" | "inactive" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
      return "canceled";
    case "past_due":
      return "inactive";
    default:
      return "inactive";
  }
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

export function getStripeCustomerId(
  customer: Stripe.Checkout.Session["customer"] | Stripe.Subscription["customer"]
): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

export async function resolveUserIdFromSubscription(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<string | null> {
  const fromMetadata = subscription.metadata?.supabase_user_id;
  if (fromMetadata) return fromMetadata;

  const customerId = getStripeCustomerId(subscription.customer);
  if (!customerId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  return profile?.id ?? null;
}

export async function resolveUserIdFromCustomerId(
  supabase: SupabaseClient,
  customerId: string
): Promise<string | null> {
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

  const plan = normalizeSubscriptionPlan(
    planOverride || subscription.metadata?.plan
  );

  const updates: Record<string, string | null> = {
    subscription_status: mapSubscriptionStatus(subscription.status),
    subscription_plan: plan,
    subscription_end_date: getSubscriptionPeriodEnd(subscription),
  };

  const customerId = getStripeCustomerId(subscription.customer);
  if (customerId) {
    updates.stripe_customer_id = customerId;
  }

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
