import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import {
  getSubscriptionPeriodEnd,
  mapSubscriptionStatus,
} from "@/lib/subscription-sync";
import { getResetDateIn30Days } from "@/lib/generation-limits";

function normalizePlan(plan: string | undefined): "monthly" | "yearly" {
  if (plan === "yearly" || plan === "annual") return "yearly";
  return "monthly";
}

export async function activateSubscriptionFromSession(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const userId = session.metadata?.supabase_user_id;
  const isPaid =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";

  if (!userId || !isPaid) {
    return false;
  }

  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    return false;
  }

  const subscription =
    typeof subscriptionId === "string"
      ? await stripe.subscriptions.retrieve(subscriptionId)
      : subscriptionId;

  const plan = normalizePlan(session.metadata?.plan);

  const serviceClient = await createServiceClient();
  const updates: {
    subscription_status: string;
    subscription_plan: string;
    subscription_end_date: string | null;
    generations_used: number;
    generations_reset_date: string;
    full_name?: string;
  } = {
    subscription_status: "active",
    subscription_plan: plan,
    subscription_end_date: getSubscriptionPeriodEnd(subscription),
    generations_used: 0,
    generations_reset_date: getResetDateIn30Days(),
  };

  if (session.customer_details?.name) {
    updates.full_name = session.customer_details.name;
  }

  const { error } = await serviceClient
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Failed to activate subscription:", error);
    return false;
  }

  return true;
}
