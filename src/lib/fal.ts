import { GENERATION_MAX_MS } from "@/lib/generation-config";

const FAL_MODEL = "fal-ai/flux-pro/kontext/max";

export function isFalConfigured(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

export function isKieConfigured(): boolean {
  return Boolean(process.env.KIE_API_KEY?.trim());
}

/** fal.ai uniquement si GENERATION_PROVIDER=fal (défaut : Kie / nano-banana-2) */
export function shouldUseFalPrimary(): boolean {
  return process.env.GENERATION_PROVIDER === "fal";
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
    const response = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_url: imageUrl,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        output_format: "jpeg",
        image_size: "square_hd",
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
      throw new Error("La génération a pris trop de temps. Réessayez.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
