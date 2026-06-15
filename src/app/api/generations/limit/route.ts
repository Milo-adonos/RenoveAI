import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  canGenerateWithProfile,
  getNextCalendarMonthStart,
  isMonthlyPlan,
  MONTHLY_GENERATION_LIMIT,
  shouldResetMonthlyGenerations,
} from "@/lib/generation-limits";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();
    const { data: profile } = await serviceClient
      .from("profiles")
      .select(
        "subscription_plan, subscription_status, generations_used, generations_reset_date"
      )
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let used = profile.generations_used ?? 0;
    let resetDate = profile.generations_reset_date;

    if (shouldResetMonthlyGenerations(resetDate)) {
      used = 0;
      resetDate = getNextCalendarMonthStart().toISOString();
      await serviceClient
        .from("profiles")
        .update({
          generations_used: 0,
          generations_reset_date: resetDate,
        })
        .eq("id", user.id);
    }

    const plan = profile.subscription_plan || "monthly";
    const isMonthly = isMonthlyPlan(plan);

    return NextResponse.json({
      plan,
      status: profile.subscription_status,
      isMonthly,
      isYearly: !isMonthly && plan === "yearly",
      monthlyLimit: MONTHLY_GENERATION_LIMIT,
      generationsUsed: used,
      generationsRemaining: isMonthly
        ? Math.max(0, MONTHLY_GENERATION_LIMIT - used)
        : null,
      canGenerate: canGenerateWithProfile(profile, used),
      resetDate,
    });
  } catch (error) {
    console.error("[generations/limit] Error:", error);
    return NextResponse.json(
      { error: "Failed to check limit" },
      { status: 500 }
    );
  }
}
