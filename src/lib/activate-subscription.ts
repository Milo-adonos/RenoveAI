import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

export async function activateSubscriptionFromSession(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const userId = session.metadata?.supabase_user_id;
  if (!userId || session.payment_status !== "paid") {
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

  const plan = (session.metadata?.plan || "monthly") as
    | "weekly"
    | "monthly"
    | "annual";

  const serviceClient = await createServiceClient();
  const updates: {
    subscription_status: string;
    subscription_plan: string;
    subscription_end_date: string;
    full_name?: string;
  } = {
    subscription_status:
      subscription.status === "active" ? "active" : "inactive",
    subscription_plan: plan,
    subscription_end_date: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
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
