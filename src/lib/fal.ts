import { GENERATION_MAX_MS } from "@/lib/generation-config";
import { buildFalGenerationPrompts } from "@/lib/generation-prompt";

const FAL_NANO_BANANA_MODEL = "fal-ai/nano-banana-2/edit";

export function isFalConfigured(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

export function isKieConfigured(): boolean {
  return Boolean(process.env.KIE_API_KEY?.trim());
}

/** nano-banana-2 sur fal — même modèle que Kie, réponse synchrone plus rapide */
export async function generateWithFal(
  imageUrl: string,
  style?: string | null,
  customPrompt?: string | null
): Promise<string> {
  const key = process.env.FAL_KEY?.trim();
  if (!key) {
    throw new Error("FAL_KEY not configured");
  }

  const { systemPrompt, prompt } = buildFalGenerationPrompts(style, customPrompt);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_MAX_MS - 500);

  try {
    const response = await fetch(
      `https://fal.run/${FAL_NANO_BANANA_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          prompt,
          image_urls: [imageUrl],
          num_images: 1,
          aspect_ratio: "auto",
          output_format: "jpeg",
          resolution: "1K",
          limit_generations: true,
          enable_web_search: false,
          thinking_level: "high",
        }),
        signal: controller.signal,
      }
    );

    const data = (await response.json()) as {
      images?: { url: string }[];
      detail?: string;
      message?: string;
    };

    if (!response.ok) {
      throw new Error(data.detail || data.message || "Fal generation failed");
    }

    const url = data.images?.[0]?.url;
    if (!url) {
      throw new Error("Fal returned no image");
    }

    return url;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("La génération a pris trop de temps. Réessayez.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
