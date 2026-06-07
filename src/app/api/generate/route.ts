import { NextRequest, NextResponse } from "next/server";
import { createGenerationTask, pollTaskResult } from "@/lib/kie";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { uploadImageToStorage } from "@/lib/supabase/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, prompt, style, customPrompt } = body;

    console.log("[generate] Étape 1 — Requête reçue");
    console.log("[generate] Config Supabase:", getSupabaseConfigStatus());
    console.log("[generate] imageUrl présent:", !!imageUrl);
    console.log("[generate] imageUrl type:", imageUrl?.startsWith("data:") ? "base64" : imageUrl?.startsWith("http") ? "url" : "inconnu");
    console.log("[generate] prompt:", prompt?.slice(0, 80));
    console.log("[generate] style:", style);

    if (!imageUrl || !prompt) {
      console.error("[generate] Erreur — imageUrl ou prompt manquant");
      return NextResponse.json(
        { error: "imageUrl and prompt are required" },
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

    console.log("[generate] Étape 3 — Appel Kie.ai...");
    const taskId = await createGenerationTask(finalImageUrl, prompt);
    console.log("[generate] Task ID:", taskId);

    console.log("[generate] Étape 4 — Polling résultat...");
    const generatedUrl = await pollTaskResult(taskId);
    console.log("[generate] Image générée:", generatedUrl);

    console.log("[generate] Étape 5 — Sauvegarde image générée...");
    const imageRes = await fetch(generatedUrl);
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const genPath = `temp/${Date.now()}-generated.jpg`;

    const genResult = await uploadImageToStorage(
      imageBuffer,
      genPath,
      "generated"
    );

    const savedUrl = "error" in genResult ? generatedUrl : genResult.url;

    if ("error" in genResult) {
      console.warn("[generate] Sauvegarde generated échouée, URL Kie utilisée:", genResult.error);
    }

    console.log("[generate] Étape 6 — Terminé ✓");

    return NextResponse.json({
      generatedUrl: savedUrl,
      style,
      customPrompt,
    });
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
