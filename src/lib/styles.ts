import {
  AI_CHOICE_PROMPT,
  SYSTEM_PROMPT,
  stylePrompts,
} from "@/lib/prompts";

export const AI_CHOICE_STYLE = "ai_choice";

export { AI_CHOICE_PROMPT, SYSTEM_PROMPT, stylePrompts };

export type SpaceType =
  | "bedroom"
  | "living_room"
  | "kitchen"
  | "bathroom"
  | "garden_exterior"
  | "facade"
  | "office"
  | "other";

const SPACE_IF_MARKERS: Record<Exclude<SpaceType, "other">, RegExp> = {
  bedroom: /If BEDROOM\s*:/i,
  living_room: /If LIVING ROOM\s*:/i,
  kitchen: /If KITCHEN\s*:/i,
  bathroom: /If BATHROOM\s*:/i,
  garden_exterior: /If GARDEN\/EXTERIOR\s*:/i,
  facade: /If FACADE\s*:/i,
  office: /If OFFICE\s*:/i,
};

function getStyleIntro(prompt: string): string {
  const firstSection = prompt.search(/\n\n(?:If [A-Z]|For ANY space type)/i);
  if (firstSection === -1) return prompt.trim();
  return prompt.slice(0, firstSection).trim();
}

function extractIfSection(prompt: string, marker: RegExp): string | null {
  const match = marker.exec(prompt);
  if (!match || match.index === undefined) return null;

  const rest = prompt.slice(match.index);
  const nextSection = rest.slice(match[0].length).search(/\n\nIf [A-Z]/);
  return (
    nextSection === -1 ? rest : rest.slice(0, match[0].length + nextSection)
  ).trim();
}

function extractForAnySection(prompt: string): string | null {
  const match = /For ANY space type\s*:/i.exec(prompt);
  if (!match || match.index === undefined) return null;

  const rest = prompt.slice(match.index);
  const nextIf = rest.slice(match[0].length).search(/\n\nIf [A-Z]/);
  return (nextIf === -1 ? rest : rest.slice(0, match[0].length + nextIf)).trim();
}

export function getStylePromptForSpace(
  style: string,
  spaceType: SpaceType
): string {
  const fullStylePrompt = stylePrompts[style];
  if (!fullStylePrompt) return "Redesign this space beautifully.";

  const intro = getStyleIntro(fullStylePrompt);

  if (spaceType !== "other") {
    const ifSection = extractIfSection(
      fullStylePrompt,
      SPACE_IF_MARKERS[spaceType]
    );
    if (ifSection) {
      const anySection = extractForAnySection(fullStylePrompt);
      if (
        anySection &&
        fullStylePrompt.indexOf(anySection) < fullStylePrompt.indexOf(ifSection)
      ) {
        return `${intro}\n\n${anySection}\n\n${ifSection}`;
      }
      return `${intro}\n\n${ifSection}`;
    }
  }

  const anySection = extractForAnySection(fullStylePrompt);
  if (anySection) return `${intro}\n\n${anySection}`;

  return fullStylePrompt;
}

export function buildFullPrompt(
  style?: string | null,
  customPrompt?: string | null,
  spaceType: SpaceType = "other"
): string {
  if (customPrompt?.trim()) {
    return `${SYSTEM_PROMPT}\n\n${customPrompt.trim()}`;
  }

  if (style === AI_CHOICE_STYLE) {
    return `${SYSTEM_PROMPT}\n\n${AI_CHOICE_PROMPT}`;
  }

  if (style && stylePrompts[style]) {
    const stylePart = getStylePromptForSpace(style, spaceType);
    return `${SYSTEM_PROMPT}\n\n${stylePart}`;
  }

  return `${SYSTEM_PROMPT}\n\nRedesign this space beautifully.`;
}

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
  return buildFullPrompt(style, customPrompt);
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
