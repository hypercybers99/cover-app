import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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

function collectFiles(dir) {
  const results = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git' || f === 'dist' || f === 'contracts' || f === 'test-results') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.md') || f.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const files = collectFiles(rootDir);
let violations = 0;

for (const file of files) {
  if (file.includes('scan_banned.mjs') || file.includes('scans.test.ts') || file.includes('package-lock.json')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    if (lineText.includes('bannedWords') || lineText.includes("'bytecode'") || lineText.includes('"bytecode"')) return;
    for (const w of bannedWords) {
      const regex = new RegExp(`\\b${w}\\b`, 'i');
      if (regex.test(lineText)) {
        console.error(`BANNED WORD: "${w}" in ${path.relative(rootDir, file)}:${idx + 1}`);
        violations++;
      }
    }
    if (/live protection|live contract|live network|live data|live blockchain/i.test(lineText)) {
      console.error(`BANNED WORD: "Live" used as descriptor in ${path.relative(rootDir, file)}:${idx + 1}`);
      violations++;
    }
  });
}

if (violations > 0) {
  console.error(`Scan failed: ${violations} banned word occurrences found!`);
  process.exit(1);
} else {
  console.log('Banned words scan passed: 0 occurrences.');
}
