import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { persistGeneratedImageFromUrl } from "@/lib/supabase/storage";
import { canGenerateWithCredits } from "@/lib/credits";
import { refreshProCreditsIfDue } from "@/lib/credits-activation";

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
        "credits_balance, subscription_status, subscription_plan, credits_reset_date"
      )
      .eq("id", user.id)
      .single();

    if (!profile || profile.subscription_status !== "active") {
      return NextResponse.json({ error: "no_subscription" }, { status: 403 });
    }

    const creditsBalance = await refreshProCreditsIfDue(
      serviceClient,
      user.id,
      profile
    );

    const enrichedProfile = { ...profile, credits_balance: creditsBalance };

    if (!canGenerateWithCredits(enrichedProfile)) {
      return NextResponse.json({ error: "no_credits" }, { status: 403 });
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

    if (asyncCompletion) {
      await serviceClient
        .from("profiles")
        .update({ credits_balance: creditsBalance - 1 })
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
