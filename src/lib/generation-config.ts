/** Objectif affiché (barre de progression) — nano-banana ~30–60 s */
export const GENERATION_TYPICAL_MS = 45_000;

/** Limite max Kie — qualité prioritaire sur la vitesse */
export const GENERATION_MAX_MS = 90_000;

/** Alias pour le polling et la page loading */
export const GENERATION_SAFETY_TIMEOUT_MS = GENERATION_MAX_MS;

/** Vérification statut Kie */
export const GENERATION_POLL_INTERVAL_MS = 800;
