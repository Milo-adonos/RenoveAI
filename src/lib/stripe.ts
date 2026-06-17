import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export type CheckoutPlan = "discovery" | "pro" | "credits_5" | "credits_15";

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_URL ||
    "http://localhost:3000"
  );
}

export function parseCheckoutPlan(value: string | null | undefined): CheckoutPlan | null {
  if (
    value === "discovery" ||
    value === "pro" ||
    value === "credits_5" ||
    value === "credits_15"
  ) {
    return value;
  }
  return null;
}

export function getCheckoutConfig(plan: CheckoutPlan): {
  mode: Stripe.Checkout.SessionCreateParams.Mode;
  priceId: string;
} | null {
  switch (plan) {
    case "discovery":
      return {
        mode: "payment",
        priceId: process.env.STRIPE_PRICE_DISCOVERY!,
      };
    case "pro":
      return {
        mode: "subscription",
        priceId: process.env.STRIPE_PRICE_PRO!,
      };
    case "credits_5":
      return {
        mode: "payment",
        priceId: process.env.STRIPE_PRICE_CREDITS_5!,
      };
    case "credits_15":
      return {
        mode: "payment",
        priceId: process.env.STRIPE_PRICE_CREDITS_15!,
      };
    default:
      return null;
  }
}
