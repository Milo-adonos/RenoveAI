import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { AI_COST_PER_GENERATION } from "@/lib/admin-metrics";

export async function GET() {
  try {
    const supabase = await createServiceClient();

    const { data: generations, error: generationsError } = await supabase
      .from("generations")
      .select(
        "id, user_id, generated_image_url, style, custom_prompt, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (generationsError) {
      throw generationsError;
    }

    const userIds = Array.from(
      new Set((generations ?? []).map((generation) => generation.user_id))
    );

    const emailByUserId = new Map<string, string | null>();
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) {
        throw profilesError;
      }

      for (const profile of profiles ?? []) {
        emailByUserId.set(profile.id, profile.email);
      }
    }

    const items = (generations ?? []).map((generation) => ({
      id: generation.id,
      user_id: generation.user_id,
      email: emailByUserId.get(generation.user_id) ?? null,
      generated_image_url: generation.generated_image_url,
      style: generation.style,
      custom_prompt: generation.custom_prompt,
      created_at: generation.created_at,
      aiCost: AI_COST_PER_GENERATION,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("[admin/generations] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin generations" },
      { status: 500 }
    );
  }
}
