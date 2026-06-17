import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCreditsForCheckoutPlan,
  getCreditsResetDateIn30Days,
} from "@/lib/credits";
import { getStripeCustomerId } from "@/lib/subscription-sync";

export async function applyCheckoutSessionCredits(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const userId =
    session.metadata?.userId || session.metadata?.supabase_user_id || null;
  const plan = session.metadata?.plan;

  const isPaid =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";

  if (!userId || !plan || !isPaid) {
    console.error("[credits] checkout missing userId, plan, or unpaid");
    return false;
  }

  const creditsToAdd = getCreditsForCheckoutPlan(plan);
  const customerId = getStripeCustomerId(session.customer);
  const email = session.customer_details?.email ?? null;

  if (plan === "discovery") {
    const { error } = await supabase
      .from("profiles")
      .update({
        credits_balance: creditsToAdd,
        subscription_plan: "discovery",
        subscription_status: "active",
        stripe_customer_id: customerId,
        ...(email ? { email } : {}),
        ...(session.customer_details?.name
          ? { full_name: session.customer_details.name }
          : {}),
      })
      .eq("id", userId);

    if (error) {
      console.error("[credits] discovery activation failed:", error);
      return false;
    }

    return true;
  }

  if (plan === "pro") {
    const { error } = await supabase
      .from("profiles")
      .update({
        credits_balance: creditsToAdd,
        subscription_plan: "pro",
        subscription_status: "active",
        stripe_customer_id: customerId,
        credits_reset_date: getCreditsResetDateIn30Days(),
        ...(email ? { email } : {}),
        ...(session.customer_details?.name
          ? { full_name: session.customer_details.name }
          : {}),
      })
      .eq("id", userId);

    if (error) {
      console.error("[credits] pro activation failed:", error);
      return false;
    }

    return true;
  }

  if (plan === "credits_5" || plan === "credits_15") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .single();

    const { error } = await supabase
      .from("profiles")
      .update({
        credits_balance: (profile?.credits_balance ?? 0) + creditsToAdd,
        ...(customerId ? { stripe_customer_id: customerId } : {}),
      })
      .eq("id", userId);

    if (error) {
      console.error("[credits] pack purchase failed:", error);
      return false;
    }

    return true;
  }

  return false;
}

export async function resetProCreditsForCustomer(
  supabase: SupabaseClient,
  customerId: string
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      credits_balance: 20,
      credits_reset_date: getCreditsResetDateIn30Days(),
    })
    .eq("stripe_customer_id", customerId)
    .eq("subscription_plan", "pro");

  if (error) {
    throw error;
  }
}

export async function refreshProCreditsIfDue(
  supabase: SupabaseClient,
  userId: string,
  profile: {
    subscription_plan: string | null;
    credits_reset_date: string | null;
    credits_balance: number | null;
  }
): Promise<number> {
  if (profile.subscription_plan !== "pro") {
    return profile.credits_balance ?? 0;
  }

  if (
    !profile.credits_reset_date ||
    new Date(profile.credits_reset_date) >= new Date()
  ) {
    return profile.credits_balance ?? 0;
  }

  const resetDate = getCreditsResetDateIn30Days();
  const { error } = await supabase
    .from("profiles")
    .update({
      credits_balance: 20,
      credits_reset_date: resetDate,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }

  return 20;
}
