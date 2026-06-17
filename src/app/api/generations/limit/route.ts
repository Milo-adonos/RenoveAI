import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  canGenerateWithCredits,
  getCreditsUsed,
  getPlanCreditLimit,
  PRO_CREDITS,
  DISCOVERY_CREDITS,
} from "@/lib/credits";
import { refreshProCreditsIfDue } from "@/lib/credits-activation";

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
        "credits_balance, subscription_status, subscription_plan, credits_reset_date"
      )
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const creditsBalance = await refreshProCreditsIfDue(
      serviceClient,
      user.id,
      profile
    );

    const enrichedProfile = { ...profile, credits_balance: creditsBalance };
    const plan = profile.subscription_plan || "inactive";
    const creditLimit = getPlanCreditLimit(plan);

    return NextResponse.json({
      plan,
      status: profile.subscription_status,
      creditsBalance,
      creditsLimit: creditLimit,
      creditsUsed: getCreditsUsed(enrichedProfile),
      canGenerate: canGenerateWithCredits(enrichedProfile),
      resetDate: profile.credits_reset_date,
      isDiscovery: plan === "discovery",
      isPro: plan === "pro",
      discoveryLimit: DISCOVERY_CREDITS,
      proLimit: PRO_CREDITS,
    });
  } catch (error) {
    console.error("[generations/limit] Error:", error);
    return NextResponse.json(
      { error: "Failed to check limit" },
      { status: 500 }
    );
  }
}
