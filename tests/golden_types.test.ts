import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import type {
  ProductRecord,
  PolicyRecord,
  SettlementRecord,
  PoolHealthRecord,
  PlatformLimits,
  PlatformStats,
  AttestationRecord,
} from '../src/types/contract';

function loadGolden<T>(filename: string): T {
  const filePath = path.resolve(__dirname, 'golden', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Golden Contract Types Conformance (Zero Phantom & Zero Missing Keys)', () => {
  it('validates get_product golden JSON matches ProductRecord key-for-key', () => {
    const golden = loadGolden<Record<string, unknown>>('get_product.json');
    const goldenKeys = Object.keys(golden).sort();

    const expectedKeys = [
      'creator',
      'decision_rule',
      'dir_path',
      'host',
      'id',
      'min_full',
      'min_half',
      'name',
      'policy_count',
      'pool_balance',
      'premium_bps',
      'reserved',
      'schema_version',
      'seq',
      'source_history',
      'term',
      'terms_hash',
      'url',
    ].sort();

    expect(goldenKeys).toEqual(expectedKeys);
    // Phantom clock checks
    expect(goldenKeys).not.toContain('start_time');
    expect(goldenKeys).not.toContain('end_time');
    expect(goldenKeys).not.toContain('days');
    expect(goldenKeys).not.toContain('min_duration_days');
  });

  it('validates get_policy golden JSON matches PolicyRecord key-for-key', () => {
    const golden = loadGolden<Record<string, unknown>>('get_policy.json');
    const goldenKeys = Object.keys(golden).sort();

    const expectedKeys = [
      'attempts',
      'buy_norm_hash16',
      'cancel_refund',
      'coverage',
      'decision_rule',
      'evidence_url',
      'holder',
      'id',
      'min_full',
      'min_half',
      'paid_amount',
      'payout',
      'premium',
      'premium_bps',
      'product_id',
      'schema_version',
      'seq',
      'settlement_id',
      'status',
      'term',
      'terms_hash',
    ].sort();

    expect(goldenKeys).toEqual(expectedKeys);
    // Phantom clock checks
    expect(goldenKeys).not.toContain('start_time');
    expect(goldenKeys).not.toContain('end_time');
    expect(goldenKeys).not.toContain('days');
    expect(goldenKeys).not.toContain('min_duration_days');

    // Required policy terms verification
    expect(golden['term']).toBe('OPEN_UNTIL_SETTLED_OR_CANCELLED');
    expect(typeof golden['terms_hash']).toBe('string');
    expect(typeof golden['evidence_url']).toBe('string');
    expect(typeof golden['decision_rule']).toBe('string');
  });

  it('validates get_settlement golden JSON matches SettlementRecord key-for-key', () => {
    const golden = loadGolden<Record<string, unknown>>('get_settlement.json');
    const goldenKeys = Object.keys(golden).sort();

    const expectedKeys = [
      'caller',
      'coverage',
      'evidence_url',
      'gate',
      'id',
      'minutes',
      'outcome',
      'payout',
      'policy_id',
      'product_id',
      'quote',
      'schema_version',
      'status',
      'terms_hash',
      'tripwire',
      'url_used',
    ].sort();

    expect(goldenKeys).toEqual(expectedKeys);
  });

  it('validates pool_health golden JSON matches PoolHealthRecord key-for-key', () => {
    const golden = loadGolden<Record<string, unknown>>('pool_health.json');
    const goldenKeys = Object.keys(golden).sort();

    const expectedKeys = [
      'coverage_ratio_bps',
      'free',
      'pool_balance',
      'product_id',
      'reserved',
      'schema_version',
    ].sort();

    expect(goldenKeys).toEqual(expectedKeys);
  });

  it('validates get_limits golden JSON matches PlatformLimits key-for-key', () => {
    const golden = loadGolden<Record<string, unknown>>('get_limits.json');
    const goldenKeys = Object.keys(golden).sort();

    const expectedKeys = [
      'demo_credits',
      'max_coverage',
      'max_list_limit',
      'max_page_bytes',
      'min_coverage',
      'min_text_chars',
      'schema_version',
    ].sort();

    expect(goldenKeys).toEqual(expectedKeys);
    // Ensure phantom duration limits are absent
    expect(goldenKeys).not.toContain('min_duration_days');
    expect(goldenKeys).not.toContain('max_duration_days');
  });

  it('validates get_stats golden JSON matches PlatformStats key-for-key', () => {
    const golden = loadGolden<Record<string, unknown>>('get_stats.json');
    const goldenKeys = Object.keys(golden).sort();

    const expectedKeys = [
      'next_policy',
      'next_product',
      'next_settlement',
      'schema_version',
      'total_minted',
    ].sort();

    expect(goldenKeys).toEqual(expectedKeys);
  });

  it('validates get_attestation golden JSON matches AttestationRecord key-for-key', () => {
    const golden = loadGolden<Record<string, unknown>>('get_attestation.json');
    const goldenKeys = Object.keys(golden).sort();

    const expectedKeys = [
      'attester',
      'coverage',
      'evidence_url_hash',
      'id',
      'policy_id',
      'product_id',
      'schema_version',
      'terms_hash',
    ].sort();

    expect(goldenKeys).toEqual(expectedKeys);
  });

  it('validates is_covered_for deployed result returns boolean true for valid attestation', () => {
    const golden = loadGolden<{ result: boolean }>('is_covered_for.json');
    expect(golden.result).toBe(true);
  });
});
