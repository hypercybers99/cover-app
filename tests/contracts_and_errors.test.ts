import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DEPLOYMENTS } from '../src/config/deployments';
import { ERROR_MAPPINGS, mapContractError } from '../src/lib/errors';

describe('Contracts and Deployments Integrity', () => {
  it('asserts Cover.py and CoverGuard.py sha256 hashes match deployments.ts and pre-registered prefixes', () => {
    const coverPath = path.resolve(__dirname, '../contracts/Cover.py');
    const guardPath = path.resolve(__dirname, '../contracts/CoverGuard.py');

    const coverBuf = fs.readFileSync(coverPath);
    const guardBuf = fs.readFileSync(guardPath);

    const coverSha = crypto.createHash('sha256').update(coverBuf).digest('hex');
    const guardSha = crypto.createHash('sha256').update(guardBuf).digest('hex');

    console.log(`\n[Test: Contract Source Hashes]`);
    console.log(`  Cover.py SHA-256:      ${coverSha}`);
    console.log(`  CoverGuard.py SHA-256: ${guardSha}`);

    expect(coverSha.startsWith('0b2f91d2')).toBe(true);
    expect(guardSha.startsWith('e0546c62')).toBe(true);
    expect(coverSha).toBe(DEPLOYMENTS.cover.sourceSha256);
    expect(guardSha).toBe(DEPLOYMENTS.coverGuard.sourceSha256);
  });
});

describe('Error Mapping Completeness', () => {
  function extractUserErrors(filePath: string): string[] {
    const code = fs.readFileSync(filePath, 'utf8');
    const regex = /raise\s+gl\.vm\.UserError\(([^)]+)\)/g;
    const errors: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(code)) !== null) {
      let raw = m[1].trim();
      // Unquote string literal if simple
      if (raw.startsWith('"') && raw.endsWith('"')) {
        raw = raw.slice(1, -1);
      } else if (raw.startsWith("'") && raw.endsWith("'")) {
        raw = raw.slice(1, -1);
      }
      errors.push(raw);
    }
    return errors;
  }

  it('verifies that every UserError raised in Cover.py and CoverGuard.py has an explanation mapping', () => {
    const coverPath = path.resolve(__dirname, '../contracts/Cover.py');
    const guardPath = path.resolve(__dirname, '../contracts/CoverGuard.py');

    const coverErrors = extractUserErrors(coverPath);
    const guardErrors = extractUserErrors(guardPath);

    console.log(`\n[Test: UserError Extraction Counts]`);
    console.log(`  Cover.py total raise statements:      ${coverErrors.length}`);
    console.log(`  CoverGuard.py total raise statements: ${guardErrors.length}`);
    console.log(`  Combined total raise statements:      ${coverErrors.length + guardErrors.length}`);

    const uniqueCover = Array.from(new Set(coverErrors));
    const uniqueGuard = Array.from(new Set(guardErrors));
    console.log(`  Cover.py unique error templates:      ${uniqueCover.length}`);
    console.log(`  CoverGuard.py unique error templates: ${uniqueGuard.length}`);

    // Verify Cover.py errors
    for (const err of coverErrors) {
      // Simulate real error string (e.g. replacing python f-string variables)
      let sample = err;
      if (err.startsWith('f"') || err.startsWith("f'")) {
        sample = err.slice(2, -1).replace(/\{status_code\}/, '404').replace(/\{existing_sid\}/, '1');
      }
      const mapped = mapContractError(sample);
      expect(mapped.plainMessage).not.toBe(sample); // Must not fallback to raw
      expect(mapped.plainMessage.length).toBeGreaterThan(10);
      expect(mapped.nextStep.length).toBeGreaterThan(10);
    }

    // Verify CoverGuard.py errors
    for (const err of guardErrors) {
      let sample = err;
      if (err.startsWith('f"') || err.startsWith("f'")) {
        sample = err.slice(2, -1).replace(/\{check\.get\('reason'\)\}/, 'PAID');
      }
      const mapped = mapContractError(sample);
      expect(mapped.plainMessage).not.toBe(sample); // Must not fallback to raw
      expect(mapped.plainMessage.length).toBeGreaterThan(10);
      expect(mapped.nextStep.length).toBeGreaterThan(10);
    }

    console.log(`  Completeness verified: 100% of UserError instances map to structured explanations.`);
  });

  it('extracts unique error strings from contracts and asserts exact equality with ERROR_MAPPINGS keys', () => {
    const coverPath = path.resolve(__dirname, '../contracts/Cover.py');
    const guardPath = path.resolve(__dirname, '../contracts/CoverGuard.py');

    const coverErrors = extractUserErrors(coverPath);
    const guardErrors = extractUserErrors(guardPath);

    const contractTemplates = new Set<string>();
    for (const err of coverErrors) {
      if (err.includes('{status_code}')) {
        contractTemplates.add('HTTP status not 200:');
      } else if (err.includes('{existing_sid}')) {
        contractTemplates.add('duplicate observation:');
      } else {
        contractTemplates.add(err);
      }
    }
    for (const err of guardErrors) {
      if (err.includes('not covered:')) {
        contractTemplates.add('not covered:');
      } else {
        contractTemplates.add(err);
      }
    }

    const contractList = Array.from(contractTemplates).sort();
    const errorKeys = Object.keys(ERROR_MAPPINGS).sort();

    const diffExtraInApp = errorKeys.filter(k => !contractTemplates.has(k));
    const diffMissingInApp = contractList.filter(k => !(k in ERROR_MAPPINGS));
    const fullDiff = [...diffExtraInApp.map(k => `+ ${k}`), ...diffMissingInApp.map(k => `- ${k}`)];

    console.log(`\n[Contract vs ERROR_MAPPINGS Exact Key Equality]`);
    console.log(`  Contract unique templates count: ${contractList.length}`);
    console.log(`  ERROR_MAPPINGS keys count:       ${errorKeys.length}`);
    console.log(`  Diff:                            ${JSON.stringify(fullDiff)}`);

    expect(contractList.length).toBe(errorKeys.length);
    expect(fullDiff).toEqual([]);
    expect(errorKeys).toEqual(contractList);
  });
});
