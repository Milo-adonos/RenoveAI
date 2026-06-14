import { stripe } from "@/lib/stripe";
import { getLast30DayKeys } from "@/lib/admin-metrics";

function centsToEuros(cents: number): number {
  return Math.round(cents) / 100;
}

export interface StripeRevenueStats {
  actualRevenue: number;
  actualRevenue30d: number;
  dailyRevenue: { date: string; amount: number }[];
  revenueByCustomerId: Record<string, number>;
}

export async function fetchStripeRevenueStats(): Promise<StripeRevenueStats> {
  const thirtyDaysAgo = Math.floor(
    (Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000
  );
  const dayKeys = getLast30DayKeys();
  const dailyCents = new Map(dayKeys.map((date) => [date, 0]));
  const revenueByCustomerId: Record<string, number> = {};

  let totalCents = 0;
  let last30DaysCents = 0;
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const charges = await stripe.charges.list({
      limit: 100,
      starting_after: startingAfter,
    });

    for (const charge of charges.data) {
      if (!charge.paid || charge.status !== "succeeded") continue;

      const netCents = charge.amount - (charge.amount_refunded || 0);
      if (netCents <= 0) continue;

      totalCents += netCents;

      if (charge.created >= thirtyDaysAgo) {
        last30DaysCents += netCents;
        const day = new Date(charge.created * 1000).toISOString().slice(0, 10);
        if (dailyCents.has(day)) {
          dailyCents.set(day, (dailyCents.get(day) ?? 0) + netCents);
        }
      }

      const customerId =
        typeof charge.customer === "string"
          ? charge.customer
          : charge.customer?.id;

      if (customerId) {
        revenueByCustomerId[customerId] =
          (revenueByCustomerId[customerId] ?? 0) + netCents;
      }
    }

    hasMore = charges.has_more;
    startingAfter = charges.data.at(-1)?.id;

    if (!startingAfter) {
      hasMore = false;
    }
  }

  return {
    actualRevenue: centsToEuros(totalCents),
    actualRevenue30d: centsToEuros(last30DaysCents),
    dailyRevenue: dayKeys.map((date) => ({
      date,
      amount: centsToEuros(dailyCents.get(date) ?? 0),
    })),
    revenueByCustomerId: Object.fromEntries(
      Object.entries(revenueByCustomerId).map(([id, cents]) => [
        id,
        centsToEuros(cents),
      ])
    ),
  };
}
