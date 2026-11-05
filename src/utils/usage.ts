/**
 * Token-usage helpers for the Copilot provider.
 * Kept free of `vscode` imports so they can be unit tested directly.
 */

/**
 * MIME type of the `LanguageModelDataPart` Copilot Chat reads usage from.
 *
 * Copilot Chat (VS Code ≥ 1.120) scans the response stream of
 * extension-contributed models for a data part with this MIME type and feeds
 * its JSON payload into the chat's Context Window indicator. Without it the
 * indicator stays at "0 tokens" for every third-party provider. Mirrors
 * `CustomDataPartMimeTypes.Usage` in Copilot's endpointTypes.ts.
 */
export const COPILOT_USAGE_MIME = 'usage';

/** The OpenAI-shaped usage object Copilot's `isApiUsage()` accepts. */
export interface CopilotUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: { cached_tokens: number };
  completion_tokens_details?: { reasoning_tokens: number };
}

function count(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : undefined;
}

/**
 * Turn an OpenRouter `usage` object (from the final SSE chunk) into the shape
 * Copilot expects. Returns undefined when the payload has no usable counts.
 */
export function normalizeUsage(raw: any): CopilotUsage | undefined {
  if (!raw || typeof raw !== 'object') { return undefined; }
  const prompt = count(raw.prompt_tokens);
  const completion = count(raw.completion_tokens);
  if (prompt === undefined && completion === undefined) { return undefined; }

  const usage: CopilotUsage = {
    prompt_tokens: prompt ?? 0,
    completion_tokens: completion ?? 0,
    total_tokens: count(raw.total_tokens) ?? (prompt ?? 0) + (completion ?? 0),
  };
  const cached = count(raw.prompt_tokens_details?.cached_tokens);
  if (cached !== undefined) { usage.prompt_tokens_details = { cached_tokens: cached }; }
  const reasoning = count(raw.completion_tokens_details?.reasoning_tokens);
  if (reasoning !== undefined) { usage.completion_tokens_details = { reasoning_tokens: reasoning }; }
  return usage;
}

/** Usage built from local estimates, for streams that ended without a usage chunk. */
export function estimatedUsage(promptTokens: number, completionTokens: number): CopilotUsage {
  const prompt = Math.max(0, Math.round(promptTokens));
  const completion = Math.max(0, Math.round(completionTokens));
  return { prompt_tokens: prompt, completion_tokens: completion, total_tokens: prompt + completion };
}

/** Bounds of the `openrouterModelManager.autoCompactPercent` setting. */
export const AUTO_COMPACT_MIN_PERCENT = 10;
export const AUTO_COMPACT_MAX_PERCENT = 95;

/**
 * The `openrouterModelManager.autoCompactPercent` setting as a whole
 * percentage, clamped to 10–95. Undefined (empty, 0 or not a number) means
 * "use the default compaction point".
 */
export function autoCompactPercent(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) { return undefined; }
  return Math.min(AUTO_COMPACT_MAX_PERCENT, Math.max(AUTO_COMPACT_MIN_PERCENT, Math.round(value)));
}

/**
 * The maxInputTokens Copilot should see for a model when the user picked a
 * compaction point. Copilot compacts once the prompt no longer fits in
 * maxInputTokens, so a lower value compacts earlier. The result never exceeds
 * `safeDefault` (the window minus output room and a safety margin), because a
 * prompt above that can be rejected before Copilot gets to compact it.
 */
export function copilotCompactInputTokens(
  contextLength: number,
  percent: number | undefined,
  safeDefault: number,
): number {
  if (percent === undefined) { return safeDefault; }
  return Math.min(safeDefault, Math.floor(contextLength * (percent / 100)));
}
