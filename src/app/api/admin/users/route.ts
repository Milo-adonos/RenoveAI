import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  AI_COST_PER_GENERATION,
  computeUserRevenue,
} from "@/lib/admin-metrics";

export async function GET() {
  try {
    const supabase = await createServiceClient();

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, subscription_status, subscription_plan, subscription_end_date, created_at"
      )
      .order("created_at", { ascending: false });

    if (profilesError) {
      throw profilesError;
    }

    const { data: generations, error: generationsError } = await supabase
      .from("generations")
      .select("user_id");

    if (generationsError) {
      throw generationsError;
    }

    const generationsCountByUser = new Map<string, number>();
    for (const generation of generations ?? []) {
      if (!generation.user_id) continue;
      generationsCountByUser.set(
        generation.user_id,
        (generationsCountByUser.get(generation.user_id) ?? 0) + 1
      );
    }

    const users = (profiles ?? []).map((profile) => {
      const generationsCount = generationsCountByUser.get(profile.id) ?? 0;
      const aiCost =
        Math.round(generationsCount * AI_COST_PER_GENERATION * 100) / 100;
      const revenue = computeUserRevenue(
        profile.subscription_status,
        profile.subscription_plan
      );
      const net = Math.round((revenue - aiCost) * 100) / 100;

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        subscription_status: profile.subscription_status,
        subscription_plan: profile.subscription_plan,
        subscription_end_date: profile.subscription_end_date,
        created_at: profile.created_at,
        generationsCount,
        aiCost,
        revenue: Math.round(revenue * 100) / 100,
        net,
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[admin/users] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}
