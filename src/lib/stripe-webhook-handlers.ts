import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyCheckoutSessionCredits,
  resetCreditsOnRenewalForCustomer,
} from "@/lib/credits-activation";
import {
  getStripeCustomerId,
  getSubscriptionPeriodEnd,
  resolveUserIdFromCustomerId,
  syncSubscriptionToProfile,
} from "@/lib/subscription-sync";

export async function handleCheckoutSessionCompleted(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
): Promise<void> {
  const applied = await applyCheckoutSessionCredits(supabase, session);
  if (!applied) {
    throw new Error("Failed to apply checkout session credits");
  }
  console.log(
    `[webhook] checkout.session.completed: plan=${session.metadata?.plan} user=${session.metadata?.userId || session.metadata?.supabase_user_id}`
  );
}

export async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<void> {
  const result = await syncSubscriptionToProfile(supabase, subscription);
  if (!result.ok) return;

  console.log(
    `[webhook] customer.subscription.updated: ${subscription.id} status=${subscription.status} plan=${subscription.metadata?.plan ?? "unknown"}`
  );
}

export async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = getStripeCustomerId(subscription.customer);
  if (!customerId) {
    throw new Error("No customer on deleted subscription");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_plan: "inactive",
      subscription_end_date:
        getSubscriptionPeriodEnd(subscription) ?? new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw error;
  }

  console.log(`[webhook] customer.subscription.deleted: customer ${customerId}`);
}

export async function handleInvoicePaymentSucceeded(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId = getStripeCustomerId(invoice.customer);
  if (!customerId || !invoice.subscription) return;

  await resetCreditsOnRenewalForCustomer(supabase, customerId);

  console.log(
    `[webhook] invoice.payment_succeeded: reset credits for ${customerId}`
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
