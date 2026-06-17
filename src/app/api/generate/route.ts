import { NextRequest, NextResponse } from "next/server";
import { createGenerationTask } from "@/lib/kie";
import { buildGenerationPrompt } from "@/lib/generation-prompt";
import {
  generateWithFal,
  isFalConfigured,
  isKieConfigured,
} from "@/lib/fal";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { refreshCreditsIfDue } from "@/lib/credits-activation";
import { canGenerateWithCredits, shouldDebitCredits } from "@/lib/credits";

async function getProfileWithCredits(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string
) {
  const { data: profile } = await serviceClient
    .from("profiles")
    .select(
      "credits_balance, subscription_status, subscription_plan, credits_reset_date"
    )
    .eq("id", userId)
    .single();

  if (!profile) return null;

  const creditsBalance = await refreshCreditsIfDue(
    serviceClient,
    userId,
    profile
  );

  return {
    ...profile,
    credits_balance: creditsBalance,
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();
    const profile = await getProfileWithCredits(serviceClient, user.id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.subscription_status !== "active") {
      return NextResponse.json({ error: "no_subscription" }, { status: 403 });
    }

    if (!canGenerateWithCredits(profile)) {
      return NextResponse.json({ error: "no_credits" }, { status: 403 });
    }

    const body = await request.json();
    const { imageUrl, style, customPrompt } = body;

    console.log("[generate] Étape 1 — Requête reçue");
    console.log("[generate] Config Supabase:", getSupabaseConfigStatus());
    console.log("[generate] imageUrl présent:", !!imageUrl);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    let finalImageUrl = imageUrl;

    if (imageUrl.startsWith("data:")) {
      const base64 = imageUrl.split(",")[1];
      if (!base64) {
        return NextResponse.json(
          { error: "Format base64 invalide dans sessionStorage" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(base64, "base64");
      const path = `temp/${Date.now()}-upload.jpg`;
      const result = await uploadImageToStorage(buffer, path, "originals");

      if ("error" in result) {
        return NextResponse.json(
          {
            error: `Échec upload Supabase : ${result.error}`,
            hint: "Vérifie .env.local et exécute supabase/storage.sql dans le dashboard Supabase",
          },
          { status: 500 }
        );
      }

      finalImageUrl = result.url;
    }

    const fullPrompt = buildGenerationPrompt(style, customPrompt);

    const debitCredit = async () => {
      if (!shouldDebitCredits(profile.subscription_plan)) return;

      await serviceClient
        .from("profiles")
        .update({ credits_balance: (profile.credits_balance ?? 0) - 1 })
        .eq("id", user.id);
    };

    if (isFalConfigured()) {
      try {
        const generatedUrl = await generateWithFal(
          finalImageUrl,
          style,
          customPrompt
        );
        await debitCredit();
        return NextResponse.json({
          generatedUrl,
          style,
          customPrompt,
          sync: true,
        });
      } catch (falError) {
        console.warn("[generate] fal failed, fallback Kie:", falError);
      }
    }

    if (!isKieConfigured()) {
      return NextResponse.json(
        { error: "Aucun provider IA configuré (FAL_KEY ou KIE_API_KEY)" },
        { status: 500 }
      );
    }

    const taskId = await createGenerationTask(finalImageUrl, fullPrompt);
    return NextResponse.json({ taskId, style, customPrompt });
  } catch (error) {
    console.error("[generate] Erreur fatale:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 }
    );
  }
}
