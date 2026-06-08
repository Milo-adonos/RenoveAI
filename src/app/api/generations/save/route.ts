import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { persistGeneratedImageFromUrl } from "@/lib/supabase/storage";
import {
  shouldResetWeeklyCounter,
  WEEKLY_LIMIT,
} from "@/lib/weekly-generations";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { originalUrl, generatedUrl, style, customPrompt, originalPath } =
      await request.json();

    if (!originalUrl || !generatedUrl) {
      return NextResponse.json(
        { error: "Missing image URLs" },
        { status: 400 }
      );
    }

    const serviceClient = await createServiceClient();
    let finalOriginalUrl = originalUrl;

    // Move from temp to permanent if we have a storage path
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
      .select("subscription_plan, weekly_generations_used, weekly_reset_date")
      .eq("id", user.id)
      .single();

    const plan = profile?.subscription_plan || "monthly";
    let weeklyUsed = profile?.weekly_generations_used ?? 0;

    if (shouldResetWeeklyCounter(profile?.weekly_reset_date)) {
      weeklyUsed = 0;
    }

    if (plan === "weekly" && weeklyUsed >= WEEKLY_LIMIT) {
      return NextResponse.json(
        { error: "Weekly generation limit reached" },
        { status: 429 }
      );
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

    if (plan === "weekly") {
      await serviceClient
        .from("profiles")
        .update({
          weekly_generations_used: weeklyUsed + 1,
          weekly_reset_date: new Date().toISOString(),
        })
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
