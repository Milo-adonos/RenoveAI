import {
  AI_CHOICE_PROMPT,
  AI_CHOICE_STYLE,
  STRUCTURE_LOCK,
  SYSTEM_PROMPT,
  stylePrompts,
} from "@/lib/styles";

export { SYSTEM_PROMPT };

/** Règles structure — utilisé comme system_prompt sur fal */
export function getStructureSystemPrompt(): string {
  return `${SYSTEM_PROMPT}\n\n${STRUCTURE_LOCK}`;
}

function withStructureLock(body: string): string {
  return `${body}\n\n${STRUCTURE_LOCK}`;
}

function buildStylePrompt(
  style?: string | null,
  customPrompt?: string | null
): string {
  if (customPrompt?.trim()) {
    return customPrompt.trim();
  }

  if (style === AI_CHOICE_STYLE) {
    return AI_CHOICE_PROMPT;
  }

  const stylePrompt =
    style && stylePrompts[style] ? stylePrompts[style] : stylePrompts.Moderne;

  return stylePrompt;
}

/** Prompt complet pour Kie (un seul champ) */
export function buildGenerationPrompt(
  style?: string | null,
  customPrompt?: string | null
): string {
  return withStructureLock(
    `${SYSTEM_PROMPT}\n\n${buildStylePrompt(style, customPrompt)}`
  );
}

/** Prompts séparés pour fal (system_prompt + instruction) */
export function buildFalGenerationPrompts(
  style?: string | null,
  customPrompt?: string | null
): { systemPrompt: string; prompt: string } {
  return {
    systemPrompt: getStructureSystemPrompt(),
    prompt: `${buildStylePrompt(style, customPrompt)}\n\n${STRUCTURE_LOCK}`,
  };
}
