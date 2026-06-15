import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import {
  getStripeCustomerId,
  getSubscriptionPeriodEnd,
  normalizeSubscriptionPlan,
} from "@/lib/subscription-sync";
import { getResetDateIn30Days } from "@/lib/generation-limits";

export async function activateSubscriptionFromSession(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const userId = session.metadata?.supabase_user_id;
  const isPaid =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";

  if (!userId || !isPaid) {
    console.error("[webhook] checkout.session.completed: missing user or unpaid");
    return false;
  }

  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.error("[webhook] checkout.session.completed: no subscription on session");
    return false;
  }

  const subscription =
    typeof subscriptionId === "string"
      ? await stripe.subscriptions.retrieve(subscriptionId)
      : subscriptionId;

  const plan = normalizeSubscriptionPlan(session.metadata?.plan);
  const customerId = getStripeCustomerId(session.customer);
  const email = session.customer_details?.email ?? null;

  const serviceClient = await createServiceClient();
  const updates: Record<string, string | number | null> = {
    subscription_status: "active",
    subscription_plan: plan,
    subscription_end_date: getSubscriptionPeriodEnd(subscription),
    generations_used: 0,
    generations_reset_date: getResetDateIn30Days(),
  };

  if (customerId) {
    updates.stripe_customer_id = customerId;
  }

  if (email) {
    updates.email = email;
  }

  if (session.customer_details?.name) {
    updates.full_name = session.customer_details.name;
  }

  const { error } = await serviceClient
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("[webhook] checkout.session.completed update failed:", error);
    return false;
  }

  console.log(
    `[webhook] checkout.session.completed: activated ${userId} plan=${plan} customer=${customerId}`
  );
  return true;
}
