import {
  AI_CHOICE_PROMPT,
  AI_CHOICE_STYLE,
  SYSTEM_PROMPT,
  stylePrompts,
} from "@/lib/styles";

export { SYSTEM_PROMPT };

export function buildGenerationPrompt(
  style?: string | null,
  customPrompt?: string | null
): string {
  if (customPrompt?.trim()) {
    return `${SYSTEM_PROMPT}\n\n${customPrompt.trim()}`;
  }

  if (style === AI_CHOICE_STYLE) {
    return `${SYSTEM_PROMPT}\n\n${AI_CHOICE_PROMPT}`;
  }

  const stylePrompt =
    style && stylePrompts[style] ? stylePrompts[style] : stylePrompts.Moderne;

  return `${SYSTEM_PROMPT}\n\n${stylePrompt}`;
}
