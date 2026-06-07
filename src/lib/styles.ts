export const AI_CHOICE_STYLE = "ai_choice";

export const AI_CHOICE_PROMPT =
  "Analyze this room and redesign it with the most suitable and beautiful interior design style that fits the space, lighting, and proportions. Make it stunning.";

export const stylePrompts: Record<string, string> = {
  Moderne:
    "redesign this room in a modern style with clean lines, neutral colors, minimalist furniture",
  Scandinave:
    "redesign this room in Scandinavian style with light wood, white walls, cozy textiles",
  Cosy: "redesign this room in a cozy warm style with soft lighting, warm colors, comfortable furniture",
  Industriel:
    "redesign this room in industrial style with exposed brick, metal accents, dark tones",
  Minimaliste:
    "redesign this room in minimalist style, very clean, few furniture pieces, monochrome",
  Bohème:
    "redesign this room in bohemian style with plants, colorful textiles, natural materials",
  "Gaming Setup":
    "redesign this room as a gaming setup with RGB lighting, gaming desk, monitors",
  Japonais:
    "redesign this room in Japanese minimalist style with natural wood, zen atmosphere",
  Luxe: "redesign this room in luxury style with premium materials, elegant furniture, gold accents",
  Contemporain:
    "redesign this room in contemporary style with modern furniture and warm neutral tones",
  "Art Déco":
    "redesign this room in Art Deco style with geometric patterns, gold accents, bold colors",
  Rustique:
    "redesign this room in rustic style with natural wood, stone, warm earth tones",
  Tropical:
    "redesign this room in tropical style with plants, rattan furniture, light colors",
  Zen: "redesign this room in zen style with natural materials, soft lighting, peaceful atmosphere",
  Provençal:
    "redesign this room in Provençal French style with lavender tones, rustic charm, warm sunlight",
  Vintage:
    "redesign this room in vintage style with retro furniture, warm colors, old-school details",
  Loft: "redesign this room as a modern loft with high ceilings feel, exposed elements, urban style",
  Cottage:
    "redesign this room in cottage style with floral patterns, pastel colors, cozy English feel",
};

export const roomStyles = Object.keys(stylePrompts);

export const styleThumbnails: Record<string, string> = {
  Moderne: "/styles/moderne.jpg",
  Scandinave: "/styles/scandinave.jpg",
  Cosy: "/styles/cosy.jpg",
  Industriel: "/styles/industriel.jpg",
  Minimaliste: "/styles/minimaliste.jpg",
  Bohème: "/styles/boheme.jpg",
  "Gaming Setup": "/styles/gaming.jpg",
  Japonais: "/styles/japonais.jpg",
  Luxe: "/styles/luxe.jpg",
  Contemporain: "/styles/contemporain.jpg",
  "Art Déco": "/styles/artdeco.jpg",
  Rustique: "/styles/rustique.jpg",
  Tropical: "/styles/tropical.jpg",
  Zen: "/styles/zen.jpg",
  Provençal: "/styles/provencal.jpg",
  Vintage: "/styles/vintage.jpg",
  Loft: "/styles/loft.jpg",
  Cottage: "/styles/cottage.jpg",
};

export const styleLabels: Record<string, string> = {
  [AI_CHOICE_STYLE]: "Laisse l'IA décider",
};

export function getStyleLabel(style?: string | null): string {
  if (!style) return "";
  return styleLabels[style] || style;
}

export function getPromptForStyle(
  style?: string | null,
  customPrompt?: string | null
): string {
  if (customPrompt?.trim()) return customPrompt.trim();
  if (style === AI_CHOICE_STYLE) return AI_CHOICE_PROMPT;
  if (style && stylePrompts[style]) return stylePrompts[style];
  return "redesign this room beautifully";
}

export const beforeAfterExamples = [
  {
    before: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop",
    style: "Moderne",
  },
  {
    before: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop",
    style: "Scandinave",
  },
  {
    before: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=600&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&h=400&fit=crop",
    style: "Cosy",
  },
  {
    before: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&h=400&fit=crop",
    style: "Industriel",
  },
];
