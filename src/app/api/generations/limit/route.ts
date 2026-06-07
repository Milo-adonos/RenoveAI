import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  getNextMonday,
  getWeeklyLimitInfo,
  shouldResetWeeklyCounter,
  WEEKLY_LIMIT,
} from "@/lib/weekly-generations";

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
        "subscription_plan, subscription_status, weekly_generations_used, weekly_reset_date"
      )
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let used = profile.weekly_generations_used ?? 0;

    if (shouldResetWeeklyCounter(profile.weekly_reset_date)) {
      used = 0;
      await serviceClient
        .from("profiles")
        .update({
          weekly_generations_used: 0,
          weekly_reset_date: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    const plan = profile.subscription_plan || "monthly";
    const isWeekly = plan === "weekly";
    const weekly = getWeeklyLimitInfo(used);

    return NextResponse.json({
      plan,
      status: profile.subscription_status,
      isWeekly,
      weeklyLimit: WEEKLY_LIMIT,
      weeklyUsed: used,
      weeklyRemaining: weekly.remaining,
      canGenerate: !isWeekly || used < WEEKLY_LIMIT,
      resetDate: getNextMonday().toISOString(),
    });
  } catch (error) {
    console.error("[generations/limit] Error:", error);
    return NextResponse.json(
      { error: "Failed to check limit" },
      { status: 500 }
    );
  }
}
