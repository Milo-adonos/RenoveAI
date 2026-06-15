import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { activateSubscriptionFromSession } from "@/lib/activate-subscription";
import {
  getStripeCustomerId,
  getSubscriptionPeriodEnd,
  resolveUserIdFromCustomerId,
  resolveUserIdFromSubscription,
  syncSubscriptionToProfile,
} from "@/lib/subscription-sync";
import { getResetDateIn30Days } from "@/lib/generation-limits";

export async function handleCheckoutSessionCompleted(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
): Promise<void> {
  await activateSubscriptionFromSession(session);
}

export async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<void> {
  const result = await syncSubscriptionToProfile(supabase, subscription);
  if (!result.ok) {
    throw new Error(result.error ?? "subscription sync failed");
  }
  console.log(
    `[webhook] customer.subscription.updated: ${subscription.id} status=${subscription.status}`
  );
}

export async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = await resolveUserIdFromSubscription(supabase, subscription);

  if (!userId) {
    throw new Error("No user found for deleted subscription");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_end_date:
        getSubscriptionPeriodEnd(subscription) ?? new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }

  console.log(`[webhook] customer.subscription.deleted: user ${userId}`);
}

export async function handleInvoicePaymentSucceeded(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId = getStripeCustomerId(invoice.customer);
  if (!customerId) return;

  // Reset monthly generation quota on subscription renewals and first invoice
  if (!invoice.subscription) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      generations_used: 0,
      generations_reset_date: getResetDateIn30Days(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw error;
  }

  console.log(
    `[webhook] invoice.payment_succeeded: reset generations for ${customerId}`
  );
}

export async function handleInvoicePaymentFailed(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId = getStripeCustomerId(invoice.customer);
  if (!customerId) return;

  const userId = await resolveUserIdFromCustomerId(supabase, customerId);
  if (!userId) {
    throw new Error(`No profile for customer ${customerId}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ subscription_status: "inactive" })
    .eq("id", userId);

  if (error) {
    throw error;
  }

  console.log(`[webhook] invoice.payment_failed: user ${userId} set inactive`);
}
