/**
 * Resilient Gemini model selection utility.
 * Defines a prioritized list of model identifiers to handle regional or version-specific availability.
 */

export const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-pro',
] as const;

export type GeminiModel = typeof GEMINI_MODELS[number];

export const DEFAULT_GEMINI_MODEL: GeminiModel = 'gemini-2.0-flash';

/**
 * Returns the preferred Gemini model identifier.
 * In a more advanced implementation, this could check for availability or environment flags.
 */
export function getPreferredGeminiModel(): GeminiModel {
  return DEFAULT_GEMINI_MODEL;
}
