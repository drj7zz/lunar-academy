// All tunable values live here so teammates can change them in one place.

// Players choose from the callsigns provided by the frontend.
// Free-text callsigns are not accepted.
export const ALLOWED_CALLSIGNS: readonly string[] = [
  "Cadet Nova",
  "Astro Orion",
  "Commander Luna",
  "Ranger Cosmo",
  "Pilot Vega",
  "Scout Apollo",
];

// Current game scoring: 700 base points + five meters (maximum 100 each).
export const MAX_SCORE = 1200;
export const MAX_DAYS = 7;

export const DONKI_TIMEOUT_MS = 10000;
export const DONKI_CACHE_MS = 10 * 60 * 1000; // 10 minutes

export const RATE_LIMIT_MAX = 10;              // submissions...
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // ...per minute per IP

export const DB_NAME = "lunar_academy";
export const SCORES_COLLECTION = "scores";