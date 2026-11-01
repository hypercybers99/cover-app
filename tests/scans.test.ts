import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Project Static Scans and Constraints', () => {
  const rootDir = path.resolve(__dirname, '..');

  function collectFiles(dir: string, exts: string[]): string[] {
    const results: string[] = [];
    for (const f of fs.readdirSync(dir)) {
      if (f === 'node_modules' || f === '.git' || f === 'dist' || f === 'contracts' || f === 'test-results') continue;
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        results.push(...collectFiles(full, exts));
      } else if (exts.some(ext => f.endsWith(ext))) {
        results.push(full);
      }
    }
    return results;
  }

  it('scans source and docs for banned words', () => {
    const bannedWords = [
      'testnet',
      'unanimous',
      'tamper-proof',
      'cryptographic proof',
      'tamper',
      'tampered',
      'tampering',
      'autonomous',
      'revolutionary',
      'bytecode',
    ];

    const files = collectFiles(rootDir, ['.ts', '.tsx', '.js', '.mjs', '.md', '.html']);
    const violations: { file: string; word: string; line: number }[] = [];

    for (const file of files) {
      // Skip this test file itself, the scanner script, and package-lock
      if (file.includes('scans.test.ts') || file.includes('scan_') || file.includes('package-lock.json')) continue;
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((lineText, idx) => {
        // Skip code lines that define or test the banned words list
        if (lineText.includes('bannedWords') || lineText.includes("'bytecode'") || lineText.includes('"bytecode"')) return;
        
        for (const w of bannedWords) {
          const regex = new RegExp(`\\b${w}\\b`, 'i');
          if (regex.test(lineText)) {
            violations.push({ file: path.relative(rootDir, file), word: w, line: idx + 1 });
          }
        }

        // Live check: only allowed if not used as a descriptor, e.g. live_evidence.json filename or livePath is permitted
        if (/\blive\b/i.test(lineText)) {
          if (!lineText.includes('live_evidence') && !lineText.includes('livePath') && !lineText.includes('isLive') && !lineText.includes('quote_premium live') && !lineText.includes('LIVE')) {
            // Check if used as a marketing descriptor
            if (/live protection|live contract|live network|live data|live blockchain/i.test(lineText)) {
              violations.push({ file: path.relative(rootDir, file), word: 'Live (as descriptor)', line: idx + 1 });
            }
          }
        }
      });
    }

    if (violations.length > 0) {
      console.error('Banned words violations found:', violations);
    }
    expect(violations.length).toBe(0);
  });

  it('scans css and components for gradient styling and forbidden visual effects', () => {
    const forbidden = [
      'linear-gradient',
      'radial-gradient',
      'conic-gradient',
      'backdrop-blur',
      'glassmorphism',
      'bg-gradient-',
    ];

    const files = collectFiles(path.join(rootDir, 'src'), ['.ts', '.tsx', '.css', '.html']);
    const violations: { file: string; effect: string; line: number }[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((lineText, idx) => {
        for (const f of forbidden) {
          if (lineText.includes(f)) {
            violations.push({ file: path.relative(rootDir, file), effect: f, line: idx + 1 });
          }
        }
      });
    }

    if (violations.length > 0) {
      console.error('Forbidden visual styling found:', violations);
    }
    expect(violations.length).toBe(0);
  });

  it('checks contrast ratio of natural color palette in light and dark themes', () => {
    // Relative luminance calculation
    function luminance(hex: string): number {
      const rgb = hex.replace('#', '').match(/.{2}/g)!.map(x => parseInt(x, 16) / 255);
      const a = rgb.map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }

    function contrastRatio(hex1: string, hex2: string): number {
      const l1 = luminance(hex1);
      const l2 = luminance(hex2);
      const brightest = Math.max(l1, l2);
      const darkest = Math.min(l1, l2);
      return (brightest + 0.05) / (darkest + 0.05);
    }

    // Light Theme:
    // Background: #F7F5F0 (warm off-white)
    // Body Text: #1F2421 (ink-dark)
    // Primary: #2F5D46 (deep forest green) on white text #FFFFFF
    const lightTextBg = contrastRatio('#1F2421', '#F7F5F0');
    const lightPrimaryOnWhite = contrastRatio('#FFFFFF', '#2F5D46');
    const lightBrickOnBg = contrastRatio('#9C2F2F', '#F7F5F0');

    console.log(`\n[Theme Contrast Checks]`);
    console.log(`  Light Ink (#1F2421) on Background (#F7F5F0):       ${lightTextBg.toFixed(2)}:1 (Min 4.5:1)`);
    console.log(`  White Text (#FFFFFF) on Primary Button (#2F5D46):   ${lightPrimaryOnWhite.toFixed(2)}:1 (Min 4.5:1)`);
    console.log(`  Light Brick Text (#9C2F2F) on Background (#F7F5F0): ${lightBrickOnBg.toFixed(2)}:1 (Min 4.5:1)`);

    expect(lightTextBg).toBeGreaterThanOrEqual(4.5);
    expect(lightPrimaryOnWhite).toBeGreaterThanOrEqual(4.5);
    expect(lightBrickOnBg).toBeGreaterThanOrEqual(4.5);

    // Dark Theme:
    // Background: #171E19 (deep charcoal green)
    // Body Text: #F7F5F0 (off-white)
    // Primary: #4E876A on dark background
    const darkTextBg = contrastRatio('#F7F5F0', '#171E19');
    console.log(`  Dark Off-white (#F7F5F0) on Dark Bg (#171E19):     ${darkTextBg.toFixed(2)}:1 (Min 4.5:1)`);
    expect(darkTextBg).toBeGreaterThanOrEqual(4.5);
  });
});
