import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export function getPriceId(plan: "monthly" | "yearly") {
  if (plan === "yearly") {
    return (
      process.env.STRIPE_PRICE_YEARLY || process.env.STRIPE_PRICE_ANNUAL!
    );
  }
  return process.env.STRIPE_PRICE_MONTHLY!;
}
