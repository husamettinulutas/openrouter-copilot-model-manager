import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  autoCompactPercent,
  copilotCompactInputTokens,
  estimatedUsage,
  normalizeUsage,
} from '../utils/usage';

describe('normalizeUsage', () => {
  it('keeps OpenRouter counts and drops extra fields', () => {
    const usage = normalizeUsage({
      prompt_tokens: 12_345,
      completion_tokens: 678,
      total_tokens: 13_023,
      cost: 0.0123,
      prompt_tokens_details: { cached_tokens: 10_000, audio_tokens: 0 },
      completion_tokens_details: { reasoning_tokens: 200 },
    });
    assert.deepEqual(usage, {
      prompt_tokens: 12_345,
      completion_tokens: 678,
      total_tokens: 13_023,
      prompt_tokens_details: { cached_tokens: 10_000 },
      completion_tokens_details: { reasoning_tokens: 200 },
    });
  });

  it('derives total_tokens when missing', () => {
    assert.equal(normalizeUsage({ prompt_tokens: 100, completion_tokens: 20 })?.total_tokens, 120);
  });

  it('treats negative or non-numeric counts as missing', () => {
    assert.deepEqual(normalizeUsage({ prompt_tokens: -1, completion_tokens: 5 }), {
      prompt_tokens: 0,
      completion_tokens: 5,
      total_tokens: 5,
    });
  });

  it('returns undefined for empty or absent usage', () => {
    assert.equal(normalizeUsage(null), undefined);
    assert.equal(normalizeUsage(undefined), undefined);
    assert.equal(normalizeUsage({}), undefined);
    assert.equal(normalizeUsage({ prompt_tokens: 'many' }), undefined);
  });
});

describe('estimatedUsage', () => {
  it('rounds and sums the estimates', () => {
    assert.deepEqual(estimatedUsage(100.4, 20.6), {
      prompt_tokens: 100,
      completion_tokens: 21,
      total_tokens: 121,
    });
  });
});

describe('autoCompactPercent', () => {
  it('treats empty, zero and non-numbers as unset', () => {
    assert.equal(autoCompactPercent(null), undefined);
    assert.equal(autoCompactPercent(undefined), undefined);
    assert.equal(autoCompactPercent(0), undefined);
    assert.equal(autoCompactPercent('60'), undefined);
    assert.equal(autoCompactPercent(Number.NaN), undefined);
  });

  it('rounds and clamps to 10–95', () => {
    assert.equal(autoCompactPercent(60.4), 60);
    assert.equal(autoCompactPercent(3), 10);
    assert.equal(autoCompactPercent(100), 95);
  });
});

describe('copilotCompactInputTokens', () => {
  it('keeps the safe default when no point is chosen', () => {
    assert.equal(copilotCompactInputTokens(128_000, undefined, 100_800), 100_800);
  });

  it('lowers maxInputTokens to the chosen share of the window', () => {
    assert.equal(copilotCompactInputTokens(128_000, 50, 100_800), 64_000);
  });

  it('never goes above the safe default', () => {
    assert.equal(copilotCompactInputTokens(128_000, 95, 100_800), 100_800);
  });
});
