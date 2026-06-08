/** Temps typique Kie — sert à l'UI (message patience, barre de progression) */
export const GENERATION_TYPICAL_MS = 25_000;

/** Filet de sécurité absolu (réseau bloqué) — pas une limite Kie volontaire */
export const GENERATION_SAFETY_TIMEOUT_MS = 180_000;

/** Intervalle entre chaque vérification du statut Kie */
export const GENERATION_POLL_INTERVAL_MS = 500;
