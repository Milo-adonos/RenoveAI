import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { persistGeneratedImageFromUrl } from "@/lib/supabase/storage";
import {
  canGenerateWithProfile,
  getNextCalendarMonthStart,
  isMonthlyPlan,
  MONTHLY_GENERATION_LIMIT,
  shouldResetMonthlyGenerations,
} from "@/lib/generation-limits";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      originalUrl,
      generatedUrl,
      style,
      customPrompt,
      originalPath,
      asyncCompletion,
    } = await request.json();

    if (!originalUrl || !generatedUrl) {
      return NextResponse.json(
        { error: "Missing image URLs" },
        { status: 400 }
      );
    }

    const serviceClient = await createServiceClient();
    let finalOriginalUrl = originalUrl;

    if (originalPath && originalPath.startsWith("temp/")) {
      const permanentPath = originalPath.replace("temp/", "permanent/");
      const { data: fileData } = await serviceClient.storage
        .from("originals")
        .download(originalPath);

      if (fileData) {
        await serviceClient.storage
          .from("originals")
          .upload(permanentPath, fileData, { upsert: true });

        const { data: urlData } = serviceClient.storage
          .from("originals")
          .getPublicUrl(permanentPath);

        finalOriginalUrl = urlData.publicUrl;
        await serviceClient.storage.from("originals").remove([originalPath]);
      }
    }

    const { data: profile } = await serviceClient
      .from("profiles")
      .select(
        "subscription_plan, subscription_status, generations_used, generations_reset_date"
      )
      .eq("id", user.id)
      .single();

    if (!profile || profile.subscription_status !== "active") {
      return NextResponse.json({ error: "no_subscription" }, { status: 403 });
    }

    let used = profile.generations_used ?? 0;

    if (shouldResetMonthlyGenerations(profile.generations_reset_date)) {
      used = 0;
      await serviceClient
        .from("profiles")
        .update({
          generations_used: 0,
          generations_reset_date: getNextCalendarMonthStart().toISOString(),
        })
        .eq("id", user.id);
    }

    if (
      isMonthlyPlan(profile.subscription_plan) &&
      used >= MONTHLY_GENERATION_LIMIT
    ) {
      return NextResponse.json({ error: "limit_reached" }, { status: 403 });
    }

    if (!canGenerateWithProfile(profile, used)) {
      return NextResponse.json({ error: "limit_reached" }, { status: 403 });
    }

    let finalGeneratedUrl = generatedUrl;
    const isAlreadyStored =
      generatedUrl.includes(".supabase.co/storage/") &&
      generatedUrl.includes("/generated/");

    if (!isAlreadyStored) {
      const persisted = await persistGeneratedImageFromUrl(
        generatedUrl,
        user.id
      );
      if ("error" in persisted) {
        return NextResponse.json({ error: persisted.error }, { status: 500 });
      }
      finalGeneratedUrl = persisted.url;
    }

    const { data, error } = await serviceClient
      .from("generations")
      .insert({
        user_id: user.id,
        original_image_url: finalOriginalUrl,
        generated_image_url: finalGeneratedUrl,
        style: style || null,
        custom_prompt: customPrompt || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (isMonthlyPlan(profile.subscription_plan) && asyncCompletion) {
      await serviceClient
        .from("profiles")
        .update({ generations_used: used + 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({ generation: data });
  } catch (error) {
    console.error("Save generation error:", error);
    return NextResponse.json(
      { error: "Failed to save generation" },
      { status: 500 }
    );
  }
}
