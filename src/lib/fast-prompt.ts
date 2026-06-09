import { AI_CHOICE_STYLE } from "@/lib/styles";

const FAST_CORE =
  "Photorealistic interior photo redesign. Keep walls, windows, doors and room proportions unchanged. Match original lighting. Apply style:";

const STYLE_ONE_LINERS: Record<string, string> = {
  Moderne: "Modern — clean lines, neutral tones, sleek contemporary furniture.",
  Scandinave:
    "Scandinavian — white walls, light oak, cozy minimal furniture, natural textiles.",
  Cosy: "Cozy — warm layers, soft textiles, ambient lighting, inviting atmosphere.",
  Industriel:
    "Industrial — exposed brick/metal accents, raw materials, Edison bulbs, urban edge.",
  Minimaliste: "Minimalist — uncluttered, monochromatic, essential furniture only.",
  Bohème: "Bohemian — rich colors, plants, layered textiles, eclectic artisan decor.",
  "Gaming Setup":
    "Gaming setup — RGB accents, desk setup, ergonomic chair, LED ambient lighting.",
  Japonais:
    "Japanese — tatami/warm wood, shoji screens, low furniture, serene balance.",
  Luxe: "Luxury — marble, brass, designer furniture, hotel-suite elegance.",
  Contemporain:
    "Contemporary — curated mix, bold art, refined textures, current high-end look.",
  "Art Déco": "Art Deco — geometric patterns, gold accents, glamorous 1920s elegance.",
  Rustique: "Rustic — reclaimed wood, stone, warm earth tones, farmhouse charm.",
  Tropical: "Tropical — lush plants, rattan, bright greens, resort-like freshness.",
  Zen: "Zen — natural materials, muted palette, calm uncluttered harmony.",
  Provençal:
    "Provençal — lavender tones, rustic wood, stone, sunny Mediterranean warmth.",
  Vintage: "Vintage — retro furniture, patina, nostalgic curated character.",
  Loft: "Loft — open plan feel, high ceilings vibe, industrial-chic furniture.",
  Cottage: "Cottage — floral accents, soft pastels, charming English countryside.",
};

export function buildFastPrompt(
  style?: string | null,
  customPrompt?: string | null
): string {
  if (customPrompt?.trim()) {
    return `${FAST_CORE} ${customPrompt.trim()}`;
  }

  if (style === AI_CHOICE_STYLE) {
    return `${FAST_CORE} Pick the best style for this space and execute it beautifully.`;
  }

  if (style && STYLE_ONE_LINERS[style]) {
    return `${FAST_CORE} ${STYLE_ONE_LINERS[style]}`;
  }

  return `${FAST_CORE} Beautiful cohesive professional redesign.`;
}
