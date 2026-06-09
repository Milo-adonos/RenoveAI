import { NextRequest, NextResponse } from "next/server";
import { createGenerationTask } from "@/lib/kie";
import { buildFastPrompt } from "@/lib/fast-prompt";
import { generateWithFal, isFalConfigured } from "@/lib/fal";
import { AI_CHOICE_STYLE } from "@/lib/styles";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { createClient, createServiceClient } from "@/lib/supabase/server";
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

    if (user) {
      const serviceClient = await createServiceClient();
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("subscription_plan, weekly_generations_used, weekly_reset_date")
        .eq("id", user.id)
        .single();

      if (profile?.subscription_plan === "weekly") {
        let used = profile.weekly_generations_used ?? 0;
        if (shouldResetWeeklyCounter(profile.weekly_reset_date)) {
          used = 0;
        }
        if (used >= WEEKLY_LIMIT) {
          return NextResponse.json(
            { error: "Weekly generation limit reached" },
            { status: 429 }
          );
        }
      }
    }

    const body = await request.json();
    const { imageUrl, style, customPrompt } = body;

    console.log("[generate] Étape 1 — Requête reçue");
    console.log("[generate] Config Supabase:", getSupabaseConfigStatus());
    console.log("[generate] imageUrl présent:", !!imageUrl);
    console.log("[generate] imageUrl type:", imageUrl?.startsWith("data:") ? "base64" : imageUrl?.startsWith("http") ? "url" : "inconnu");
    console.log("[generate] style:", style);

    if (!imageUrl) {
      console.error("[generate] Erreur — imageUrl manquant");
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    let finalImageUrl = imageUrl;

    // Si base64 (fallback upload client), uploader via service role
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
      console.log("[generate] Étape 2 — URL déjà publique, pas d'upload nécessaire");
    }

    let fullPrompt: string;

    if (customPrompt?.trim()) {
      fullPrompt = buildFastPrompt(style, customPrompt);
      console.log("[generate] Étape 3 — Prompt custom (fast)");
    } else if (style === AI_CHOICE_STYLE) {
      fullPrompt = buildFastPrompt(style);
      console.log("[generate] Étape 3 — Mode Laisse l'IA décider (fast)");
    } else {
      fullPrompt = buildFastPrompt(style);
      console.log("[generate] Étape 3 — Prompt style (fast)");
    }

    console.log("[generate] Étape 4 — Génération IA...");
    if (isFalConfigured()) {
      const generatedUrl = await generateWithFal(finalImageUrl, fullPrompt);
      console.log("[generate] Fal OK — image prête");
      return NextResponse.json({ generatedUrl, style, customPrompt, sync: true });
    }

    const taskId = await createGenerationTask(finalImageUrl, fullPrompt);
    console.log("[generate] Kie task ID:", taskId);

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
