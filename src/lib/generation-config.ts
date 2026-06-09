/** Objectif affiché — nano-banana-2 ~20–40 s */
export const GENERATION_TYPICAL_MS = 30_000;

/** Limite max (fal sync ou polling Kie) */
export const GENERATION_MAX_MS = 60_000;

/** Alias pour le polling et la page loading */
export const GENERATION_SAFETY_TIMEOUT_MS = GENERATION_MAX_MS;

/** Vérification statut Kie (fallback) */
export const GENERATION_POLL_INTERVAL_MS = 500;
