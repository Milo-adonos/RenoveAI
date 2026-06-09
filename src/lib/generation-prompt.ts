import {
  AI_CHOICE_PROMPT,
  AI_CHOICE_STYLE,
  SYSTEM_PROMPT,
  buildFullPrompt,
  getStylePromptForSpace,
} from "@/lib/styles";

/** Instructions explicites pour forcer une vraie transformation visuelle */
const TRANSFORM_DIRECTIVE = `TRANSFORMATION REQUIRED — this must look dramatically renovated:
- REPLACE every piece of furniture, rug, curtain, lamp, artwork, plant and decorative object
- CHANGE wall paint/colors, flooring finish, textiles and styling to match the target style
- DO NOT leave the room looking like the original — it must be a visible before/after
- PRESERVE ONLY: wall positions, window/door locations, ceiling height, room shape, camera angle
- Keep photorealistic lighting consistent with the original photo`;

export function buildGenerationPrompt(
  style?: string | null,
  customPrompt?: string | null
): string {
  if (customPrompt?.trim()) {
    return `${SYSTEM_PROMPT}\n\n${TRANSFORM_DIRECTIVE}\n\nUser request: ${customPrompt.trim()}`;
  }

  if (style === AI_CHOICE_STYLE) {
    return `${SYSTEM_PROMPT}\n\n${TRANSFORM_DIRECTIVE}\n\n${AI_CHOICE_PROMPT}`;
  }

  if (style) {
    const stylePart = getStylePromptForSpace(style, "other");
    return `${SYSTEM_PROMPT}\n\n${TRANSFORM_DIRECTIVE}\n\n${stylePart}`;
  }

  return `${SYSTEM_PROMPT}\n\n${TRANSFORM_DIRECTIVE}\n\nRedesign this space beautifully with a complete furniture and decor makeover.`;
}

/** Prompt complet pour fal.ai (qualité max, ~15–20 s) */
export function buildFalPrompt(
  style?: string | null,
  customPrompt?: string | null
): string {
  const base = buildFullPrompt(style, customPrompt, "other");
  return `${base}\n\n${TRANSFORM_DIRECTIVE}`;
}
