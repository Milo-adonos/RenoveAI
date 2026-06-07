import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export function getPriceId(plan: "weekly" | "monthly" | "annual") {
  switch (plan) {
    case "weekly":
      return process.env.STRIPE_PRICE_WEEKLY!;
    case "annual":
      return process.env.STRIPE_PRICE_ANNUAL!;
    default:
      return process.env.STRIPE_PRICE_MONTHLY!;
  }
}
