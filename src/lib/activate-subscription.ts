import type Stripe from "stripe";
import { applyCheckoutSessionCredits } from "@/lib/credits-activation";

export async function activateSubscriptionFromSession(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const { createServiceClient } = await import("@/lib/supabase/server");
  const serviceClient = await createServiceClient();
  return applyCheckoutSessionCredits(serviceClient, session);
}
