import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import {
  getCreditsResetDateIn30Days,
  getInitialCreditsForPlan,
  isLegacyMonthlyPlan,
  isLegacyWeeklyPlan,
  isProPlan,
  isYearlyPlan,
  LEGACY_MONTHLY_CREDITS,
  PRO_CREDITS,
  shouldResetCreditsOnSchedule,
  YEARLY_UNLIMITED_CREDITS,
} from "@/lib/credits";
import {
  getStripeCustomerId,
  normalizeSubscriptionPlan,
  syncSubscriptionToProfile,
} from "@/lib/subscription-sync";

function profileExtrasFromSession(session: Stripe.Checkout.Session) {
  const customerId = getStripeCustomerId(session.customer);
  const email = session.customer_details?.email ?? null;

  return {
    stripe_customer_id: customerId,
    ...(email ? { email } : {}),
    ...(session.customer_details?.name
      ? { full_name: session.customer_details.name }
      : {}),
  };
}

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

  if (!userId || !isPaid) {
    console.error("[credits] checkout missing userId or unpaid");
    return false;
  }

  if (!plan && session.subscription) {
    return activateLegacySubscriptionFromSession(supabase, session, userId);
  }

  if (!plan) {
    console.error("[credits] checkout missing plan");
    return false;
  }

  const customerId = getStripeCustomerId(session.customer);
  const extras = profileExtrasFromSession(session);

  if (plan === "discovery") {
    const { error } = await supabase
      .from("profiles")
      .update({
        credits_balance: getInitialCreditsForPlan("discovery"),
        subscription_plan: "discovery",
        subscription_status: "active",
        ...extras,
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
        credits_balance: PRO_CREDITS,
        subscription_plan: "pro",
        subscription_status: "active",
        credits_reset_date: getCreditsResetDateIn30Days(),
        ...extras,
      })
      .eq("id", userId);

    if (error) {
      console.error("[credits] pro activation failed:", error);
      return false;
    }
    return true;
  }

  if (plan === "monthly") {
    const { error } = await supabase
      .from("profiles")
      .update({
        credits_balance: LEGACY_MONTHLY_CREDITS,
        subscription_plan: "monthly",
        subscription_status: "active",
        credits_reset_date: getCreditsResetDateIn30Days(),
        ...extras,
      })
      .eq("id", userId);

    if (error) {
      console.error("[credits] monthly activation failed:", error);
      return false;
    }
    return true;
  }

  if (plan === "yearly" || plan === "annual") {
    const { error } = await supabase
      .from("profiles")
      .update({
        credits_balance: YEARLY_UNLIMITED_CREDITS,
        subscription_plan: "yearly",
        subscription_status: "active",
        credits_reset_date: null,
        ...extras,
      })
      .eq("id", userId);

    if (error) {
      console.error("[credits] yearly activation failed:", error);
      return false;
    }
    return true;
  }

  if (plan === "credits_5" || plan === "credits_15") {
    const creditsToAdd = getInitialCreditsForPlan(plan);
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

  if (session.subscription) {
    return activateLegacySubscriptionFromSession(supabase, session, userId);
  }

  console.error("[credits] checkout unknown plan:", plan);
  return false;
}

async function activateLegacySubscriptionFromSession(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  userId: string
): Promise<boolean> {
  const subscriptionId = session.subscription;
  if (!subscriptionId) return false;

  const subscription =
    typeof subscriptionId === "string"
      ? await stripe.subscriptions.retrieve(subscriptionId)
      : subscriptionId;

  const plan = normalizeSubscriptionPlan(
    session.metadata?.plan || subscription.metadata?.plan
  );

  await syncSubscriptionToProfile(supabase, subscription, plan);

  const creditsBalance = isYearlyPlan(plan)
    ? YEARLY_UNLIMITED_CREDITS
    : plan === "monthly"
      ? LEGACY_MONTHLY_CREDITS
      : PRO_CREDITS;

  const { error } = await supabase
    .from("profiles")
    .update({
      credits_balance: creditsBalance,
      subscription_status: "active",
      subscription_plan: plan,
      credits_reset_date: isYearlyPlan(plan)
        ? null
        : getCreditsResetDateIn30Days(),
      ...profileExtrasFromSession(session),
    })
    .eq("id", userId);

  if (error) {
    console.error("[credits] legacy subscription activation failed:", error);
    return false;
  }

  return true;
}

export async function resetCreditsOnRenewalForCustomer(
  supabase: SupabaseClient,
  customerId: string
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile?.subscription_plan) return;

  const plan = profile.subscription_plan;
  let creditsBalance = 0;
  let creditsResetDate: string | null = getCreditsResetDateIn30Days();

  if (isProPlan(plan)) {
    creditsBalance = PRO_CREDITS;
  } else if (isLegacyMonthlyPlan(plan)) {
    creditsBalance = LEGACY_MONTHLY_CREDITS;
  } else if (isLegacyWeeklyPlan(plan)) {
    creditsBalance = 20;
    creditsResetDate = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();
  } else if (isYearlyPlan(plan)) {
    creditsBalance = YEARLY_UNLIMITED_CREDITS;
    creditsResetDate = null;
  } else {
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ credits_balance: creditsBalance, credits_reset_date: creditsResetDate })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw error;
  }
}

export async function refreshCreditsIfDue(
  supabase: SupabaseClient,
  userId: string,
  profile: {
    subscription_plan: string | null;
    credits_reset_date: string | null;
    credits_balance: number | null;
  }
): Promise<number> {
  if (isYearlyPlan(profile.subscription_plan)) {
    return profile.credits_balance ?? YEARLY_UNLIMITED_CREDITS;
  }

  if (
    !shouldResetCreditsOnSchedule(
      profile.credits_reset_date,
      profile.subscription_plan
    )
  ) {
    return profile.credits_balance ?? 0;
  }

  let creditsBalance = profile.credits_balance ?? 0;

  if (isProPlan(profile.subscription_plan)) {
    creditsBalance = PRO_CREDITS;
  } else if (isLegacyMonthlyPlan(profile.subscription_plan)) {
    creditsBalance = LEGACY_MONTHLY_CREDITS;
  } else if (isLegacyWeeklyPlan(profile.subscription_plan)) {
    creditsBalance = 20;
  } else {
    return profile.credits_balance ?? 0;
  }

  const resetDate =
    isLegacyWeeklyPlan(profile.subscription_plan)
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : getCreditsResetDateIn30Days();

  const { error } = await supabase
    .from("profiles")
    .update({
      credits_balance: creditsBalance,
      credits_reset_date: resetDate,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }

  return creditsBalance;
}
