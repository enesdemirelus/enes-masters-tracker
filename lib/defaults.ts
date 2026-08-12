/**
 * Server-safe shared constants.
 *
 * Lives outside `app/theme.ts` because that module is `"use client"` and route
 * handlers need these values on the server. `app/theme.ts` re-exports
 * everything here, so UI code can keep importing from a single place.
 */

/** Seeded once per school, in this order, the first time its detail is opened. */
export const DEFAULT_CHECKLIST: readonly string[] = [
  "Statement of Purpose",
  "Transcripts",
  "CV / Resume",
  "Letters of Recommendation",
  "GRE scores",
  "English proficiency",
  "Application fee paid",
  "Application submitted",
];
