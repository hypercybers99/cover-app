import { describe, it, expect } from 'vitest';
import {
  validateProductUrl,
  validateProductName,
  validateRuleText,
  validateThresholds,
  validatePremiumRate,
  validatePositiveAmount,
} from '../src/lib/validators';

describe('Table-Driven Contract Rule Validators', () => {
  describe('validateProductUrl', () => {
    const cases = [
      { url: 'https://status.nimbus.example/status.md', valid: true },
      { url: 'https://status.nimbus.example:443/status.md', valid: true },
      { url: 'http://status.nimbus.example/status.md', valid: false, error: 'bad URL: scheme must be https' },
      { url: 'https://user:pass@status.nimbus.example/status.md', valid: false, error: 'bad URL: userinfo not allowed' },
      { url: 'https://status.nimbus.example/status.md#section', valid: false, error: 'bad URL: fragment not allowed' },
      { url: 'https://192.168.1.1/status.md', valid: false, error: 'bad URL: IP literals not allowed' },
      { url: 'https://[::1]/status.md', valid: false, error: 'bad URL: IP literals not allowed' },
      { url: 'https://status.nimbus.example:8080/status.md', valid: false, error: 'bad URL: port must be 443 or omitted' },
      { url: 'https://status.nimbus.example/' + 'a'.repeat(310), valid: false, error: 'bad URL: length must be between 1 and 300 characters' },
      { url: 'https://status.nimbus.example/café.md', valid: false, error: 'bad URL: must be pure ASCII' },
      { url: '', valid: false, error: 'bad URL: length must be between 1 and 300 characters' },
    ];

    for (const c of cases) {
      it(`evaluates "${c.url.slice(0, 45)}" -> valid: ${c.valid}`, () => {
        const res = validateProductUrl(c.url);
        expect(res.valid).toBe(c.valid);
        if (!c.valid) {
          expect(res.error).toBe(c.error);
        }
      });
    }
  });

  describe('validateProductName', () => {
    const cases = [
      { name: 'Nimbus Cloud Cover', valid: true },
      { name: 'Hi', valid: false, error: 'bad name' },
      { name: 'A'.repeat(61), valid: false, error: 'bad name' },
      { name: 'Nimbus 🌟 Cover', valid: false, error: 'bad name' },
    ];

    for (const c of cases) {
      it(`evaluates name "${c.name}" -> valid: ${c.valid}`, () => {
        const res = validateProductName(c.name);
        expect(res.valid).toBe(c.valid);
        if (!c.valid) expect(res.error).toBe(c.error);
      });
    }
  });

  describe('validateRuleText', () => {
    const cases = [
      { text: 'Major outage lasting at least 60 minutes.', valid: true },
      { text: 'Too short', valid: false, error: 'bad rule text' },
      { text: 'A'.repeat(201), valid: false, error: 'bad rule text' },
      { text: 'Outage with unicode café symbol.', valid: false, error: 'bad rule text' },
    ];

    for (const c of cases) {
      it(`evaluates rule "${c.text.slice(0, 30)}" -> valid: ${c.valid}`, () => {
        const res = validateRuleText(c.text);
        expect(res.valid).toBe(c.valid);
        if (!c.valid) expect(res.error).toBe(c.error);
      });
    }
  });

  describe('validateThresholds', () => {
    const cases = [
      { minFull: 60, minHalf: 30, valid: true },
      { minFull: 2, minHalf: 1, valid: true },
      { minFull: 1, minHalf: 0, valid: false, error: 'bad thresholds' }, // minFull < 2
      { minFull: 60, minHalf: 60, valid: false, error: 'bad thresholds' }, // minHalf == minFull
      { minFull: 30, minHalf: 40, valid: false, error: 'bad thresholds' }, // minHalf > minFull
      { minFull: 10081, minHalf: 50, valid: false, error: 'bad thresholds' }, // minFull > 10080
      { minFull: 60.5, minHalf: 30, valid: false, error: 'bad thresholds' }, // not integer
    ];

    for (const c of cases) {
      it(`evaluates minFull=${c.minFull}, minHalf=${c.minHalf} -> valid: ${c.valid}`, () => {
        const res = validateThresholds(c.minFull, c.minHalf);
        expect(res.valid).toBe(c.valid);
        if (!c.valid) expect(res.error).toBe(c.error);
      });
    }
  });

  describe('validatePremiumRate', () => {
    const cases = [
      { bps: 1000, valid: true },
      { bps: 100, valid: true },
      { bps: 5000, valid: true },
      { bps: 99, valid: false, error: 'bad premium rate' },
      { bps: 5001, valid: false, error: 'bad premium rate' },
      { bps: 100.5, valid: false, error: 'bad premium rate' },
    ];

    for (const c of cases) {
      it(`evaluates bps=${c.bps} -> valid: ${c.valid}`, () => {
        const res = validatePremiumRate(c.bps);
        expect(res.valid).toBe(c.valid);
        if (!c.valid) expect(res.error).toBe(c.error);
      });
    }
  });

  describe('validatePositiveAmount', () => {
    const cases = [
      { amount: 100, valid: true },
      { amount: 1, valid: true },
      { amount: 0, valid: false, error: 'bad amount' },
      { amount: -50, valid: false, error: 'bad amount' },
      { amount: 10.5, valid: false, error: 'bad amount' },
    ];

    for (const c of cases) {
      it(`evaluates amount=${c.amount} -> valid: ${c.valid}`, () => {
        const res = validatePositiveAmount(c.amount);
        expect(res.valid).toBe(c.valid);
        if (!c.valid) expect(res.error).toBe(c.error);
      });
    }
  });
});
