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
import {
  canGenerateWithProfile,
  getNextCalendarMonthStart,
  isMonthlyPlan,
  MONTHLY_GENERATION_LIMIT,
  shouldResetMonthlyGenerations,
} from "@/lib/generation-limits";

async function getProfileWithReset(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string
) {
  const { data: profile } = await serviceClient
    .from("profiles")
    .select(
      "subscription_plan, subscription_status, generations_used, generations_reset_date"
    )
    .eq("id", userId)
    .single();

  if (!profile) return null;

  let used = profile.generations_used ?? 0;

  if (shouldResetMonthlyGenerations(profile.generations_reset_date)) {
    await serviceClient
      .from("profiles")
      .update({
        generations_used: 0,
        generations_reset_date: getNextCalendarMonthStart().toISOString(),
      })
      .eq("id", userId);
    used = 0;
    profile.generations_used = 0;
  }

  return { profile, used };
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
    const profileData = await getProfileWithReset(serviceClient, user.id);

    if (!profileData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { profile, used } = profileData;

    if (profile.subscription_status !== "active") {
      return NextResponse.json({ error: "no_subscription" }, { status: 403 });
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

    const body = await request.json();
    const { imageUrl, style, customPrompt } = body;

    console.log("[generate] Étape 1 — Requête reçue");
    console.log("[generate] Config Supabase:", getSupabaseConfigStatus());
    console.log("[generate] imageUrl présent:", !!imageUrl);
    console.log(
      "[generate] imageUrl type:",
      imageUrl?.startsWith("data:")
        ? "base64"
        : imageUrl?.startsWith("http")
          ? "url"
          : "inconnu"
    );
    console.log("[generate] style:", style);

    if (!imageUrl) {
      console.error("[generate] Erreur — imageUrl manquant");
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    let finalImageUrl = imageUrl;

    if (imageUrl.startsWith("data:")) {
      console.log("[generate] Étape 2 — Upload base64 vers Supabase Storage...");

      const base64 = imageUrl.split(",")[1];
      if (!base64) {
        return NextResponse.json(
          { error: "Format base64 invalide dans sessionStorage" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(base64, "base64");
      const path = `temp/${Date.now()}-upload.jpg`;

      console.log("[generate] Taille buffer:", buffer.length, "bytes");

      const result = await uploadImageToStorage(buffer, path, "originals");

      if ("error" in result) {
        console.error("[generate] Étape 2 ÉCHOUÉE:", result.error);
        return NextResponse.json(
          {
            error: `Échec upload Supabase : ${result.error}`,
            hint: "Vérifie .env.local et exécute supabase/storage.sql dans le dashboard Supabase",
          },
          { status: 500 }
        );
      }

      finalImageUrl = result.url;
      console.log("[generate] Étape 2 OK — URL publique:", finalImageUrl);
    } else {
      console.log(
        "[generate] Étape 2 — URL déjà publique, pas d'upload nécessaire"
      );
    }

    const fullPrompt = buildGenerationPrompt(style, customPrompt);

    console.log("[generate] Étape 3 — Prompt prêt", fullPrompt.length, "car.");
    console.log("[generate] Étape 4 — Génération nano-banana-2...");

    const incrementMonthlyUsage = async () => {
      if (isMonthlyPlan(profile.subscription_plan)) {
        await serviceClient
          .from("profiles")
          .update({ generations_used: used + 1 })
          .eq("id", user.id);
      }
    };

    if (isFalConfigured()) {
      try {
        const generatedUrl = await generateWithFal(
          finalImageUrl,
          style,
          customPrompt
        );
        await incrementMonthlyUsage();
        console.log("[generate] fal nano-banana-2 OK");
        return NextResponse.json({
          generatedUrl,
          style,
          customPrompt,
          sync: true,
        });
      } catch (falError) {
        console.warn(
          "[generate] fal nano-banana-2 échoué, repli Kie:",
          falError
        );
      }
    }

    if (!isKieConfigured()) {
      return NextResponse.json(
        { error: "Aucun provider IA configuré (FAL_KEY ou KIE_API_KEY)" },
        { status: 500 }
      );
    }

    const taskId = await createGenerationTask(finalImageUrl, fullPrompt);
    console.log("[generate] Kie nano-banana-2 task ID:", taskId);

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
