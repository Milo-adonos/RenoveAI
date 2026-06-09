import { GENERATION_MAX_MS } from "@/lib/generation-config";

const FAL_ENDPOINT = "https://fal.run/fal-ai/flux-pro/kontext";

export function isFalConfigured(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

export async function generateWithFal(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const key = process.env.FAL_KEY?.trim();
  if (!key) {
    throw new Error("FAL_KEY not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_MAX_MS - 500);

  try {
    const response = await fetch(FAL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_url: imageUrl,
        output_format: "jpeg",
        enhance_prompt: false,
        guidance_scale: 5,
        num_images: 1,
        safety_tolerance: "2",
      }),
      signal: controller.signal,
    });

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
      throw new Error("La génération a pris trop de temps (25 s max). Réessayez.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
