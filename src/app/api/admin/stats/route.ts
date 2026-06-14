import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  AI_COST_PER_GENERATION,
  MONTHLY_PLAN_PRICE,
  WEEKLY_PLAN_MONTHLY_EQUIVALENT,
  groupCountByDay,
} from "@/lib/admin-metrics";
import { fetchStripeRevenueStats } from "@/lib/stripe-revenue";

export async function GET() {
  try {
    const supabase = await createServiceClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

    const [
      generationsRes,
      profilesRes,
      activeRes,
      inactiveRes,
      canceledRes,
      weeklyRes,
      monthlyRes,
      recentGenerationsRes,
      recentProfilesRes,
      canceledRecentRes,
      stripeRevenue,
    ] = await Promise.all([
      supabase.from("generations").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "inactive"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "canceled"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active")
        .eq("subscription_plan", "weekly"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active")
        .eq("subscription_plan", "monthly"),
      supabase
        .from("generations")
        .select("created_at")
        .gte("created_at", thirtyDaysAgoIso),
      supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", thirtyDaysAgoIso),
      supabase
        .from("profiles")
        .select("subscription_end_date")
        .eq("subscription_status", "canceled")
        .gte("subscription_end_date", thirtyDaysAgoIso),
      fetchStripeRevenueStats(),
    ]);

    const totalGenerations = generationsRes.count ?? 0;
    const weeklySubscribers = weeklyRes.count ?? 0;
    const monthlySubscribers = monthlyRes.count ?? 0;
    const estimatedMRR =
      monthlySubscribers * MONTHLY_PLAN_PRICE +
      weeklySubscribers * WEEKLY_PLAN_MONTHLY_EQUIVALENT;
    const estimatedAICost = totalGenerations * AI_COST_PER_GENERATION;
    const actualRevenue = stripeRevenue.actualRevenue;
    const actualRevenue30d = stripeRevenue.actualRevenue30d;
    const actualProfit = actualRevenue - estimatedAICost;
    const estimatedProfit = estimatedMRR - estimatedAICost;
    const newUsers30d = recentProfilesRes.data?.length ?? 0;
    const canceledLast30d = canceledRecentRes.data?.length ?? 0;
    const totalUsers = profilesRes.count ?? 0;
    const churnRate30d =
      totalUsers > 0
        ? Math.round((canceledLast30d / totalUsers) * 1000) / 10
        : 0;
    const actualMarginPercent =
      actualRevenue > 0
        ? Math.round((actualProfit / actualRevenue) * 1000) / 10
        : 0;
    const estimatedMarginPercent =
      estimatedMRR > 0
        ? Math.round((estimatedProfit / estimatedMRR) * 1000) / 10
        : 0;
    const dailyGenerations = groupCountByDay(recentGenerationsRes.data ?? []);

    return NextResponse.json({
      totalGenerations,
      totalUsers,
      activeSubscribers: activeRes.count ?? 0,
      inactiveSubscribers: inactiveRes.count ?? 0,
      canceledSubscribers: canceledRes.count ?? 0,
      weeklySubscribers,
      monthlySubscribers,
      actualRevenue: Math.round(actualRevenue * 100) / 100,
      actualRevenue30d: Math.round(actualRevenue30d * 100) / 100,
      estimatedMRR: Math.round(estimatedMRR * 100) / 100,
      estimatedAICost: Math.round(estimatedAICost * 100) / 100,
      actualProfit: Math.round(actualProfit * 100) / 100,
      estimatedProfit: Math.round(estimatedProfit * 100) / 100,
      actualMarginPercent,
      estimatedMarginPercent,
      newUsers30d,
      canceledLast30d,
      churnRate30d,
      dailyGenerations,
      dailyRevenue: stripeRevenue.dailyRevenue,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[admin/stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
