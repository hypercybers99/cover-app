import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const contractRepoPath = process.env.CONTRACT_REPO_PATH || 'E:/Cover_V2.1';

console.log('======================================================');
console.log('SYNC EVIDENCE: Copy Evidence with Source Tracking');
console.log(`Source repository: ${contractRepoPath}`);
console.log('======================================================');

// Get source commit sha
let sourceCommit = 'de8ca897d2c0ad449facba25739f631292209e65';
try {
  sourceCommit = execSync(`git -C "${contractRepoPath}" rev-parse HEAD`, { encoding: 'utf8' }).trim();
} catch (e) {}

const outDir = path.join(rootDir, 'src/data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function copyWithHeader(srcRel, outName) {
  const srcFull = path.join(contractRepoPath, srcRel);
  if (!fs.existsSync(srcFull)) {
    console.warn(`Warning: source file not found: ${srcFull}`);
    return;
  }
  const raw = fs.readFileSync(srcFull, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`Error parsing JSON from ${srcFull}`);
    return;
  }

  const wrapped = {
    _meta: {
      source_repo: 'https://github.com/hypercybers99/cover-genlayer',
      source_tag: 'cover-v1-final',
      source_commit: sourceCommit,
      source_path: srcRel,
      synced_at: new Date().toISOString(),
    },
    data: data,
  };

  const outFile = path.join(outDir, outName);
  fs.writeFileSync(outFile, JSON.stringify(wrapped, null, 2), 'utf8');
  console.log(`Copied ${srcRel} -> src/data/${outName} (commit: ${sourceCommit.slice(0, 7)})`);
}

// 1. live_evidence.json (includes balance_snapshots, 39-step matrix, final states)
copyWithHeader('docs/evidence/live_evidence.json', 'live_evidence.json');

// 2. Robustness summaries
copyWithHeader('docs/evidence/robustness/iter0/runs.json', 'robustness_iter0.json');
copyWithHeader('docs/evidence/robustness/iter1/summary.json', 'robustness_iter1.json');
copyWithHeader('docs/evidence/robustness/iter2/summary.json', 'robustness_iter2.json');

// 3. Deployments info
copyWithHeader('scripts/deploy/deployments.json', 'deployments_source.json');

// 4. Generate a consolidated evidence summary module src/data/evidenceSummary.ts
const liveRaw = JSON.parse(fs.readFileSync(path.join(outDir, 'live_evidence.json'), 'utf8')).data;
const iter0Raw = JSON.parse(fs.readFileSync(path.join(outDir, 'robustness_iter0.json'), 'utf8')).data;
const iter1Raw = JSON.parse(fs.readFileSync(path.join(outDir, 'robustness_iter1.json'), 'utf8')).data;
const iter2Raw = JSON.parse(fs.readFileSync(path.join(outDir, 'robustness_iter2.json'), 'utf8')).data;

// Map filenames to short page codes: s1, s2, s3, s4, s5, s7
function formatSummaryMap(summary) {
  const map = {};
  for (const [key, val] of Object.entries(summary || {})) {
    const match = key.match(/status-(s\d)/);
    const shortKey = match ? match[1] : key;
    map[shortKey] = {
      total: val.total_runs ?? val.total ?? 0,
      parsed: val.parse_successes ?? val.parsed ?? 0,
      matches: val.outcome_matches ?? val.matches ?? 0,
      pass: val.pass_rule_met ?? val.pass ?? false,
    };
  }
  return map;
}

const normIter0 = formatSummaryMap(iter0Raw.summary);
const normIter1 = formatSummaryMap(iter1Raw.summary);
const normIter2 = iter2Raw.batches || {};

console.log('Generating evidenceSummary.ts...');
const summaryCode = `// Generated automatically by scripts/sync_evidence.mjs
// Do not edit manually.

export interface MetaHeader {
  source_repo: string;
  source_tag: string;
  source_commit: string;
  source_path: string;
  synced_at: string;
}

export interface BalanceSnapshot {
  step: string;
  underwriter: number;
  buyer: number;
  pool_balance: number;
  reserved: number;
  total_minted: number;
}

export interface TransactionEvidence {
  label: string;
  function: string;
  tx_hash: string;
  status_name: string;
  result_name: string;
  leader_result: string;
  error_payload?: string;
  latency_seconds: string;
  expected_success: boolean;
}

export interface RobustnessBatchResult {
  total: number;
  parsed: number;
  matches: number;
  pass: boolean;
}

export const EVIDENCE_META: MetaHeader = {
  source_repo: 'https://github.com/hypercybers99/cover-genlayer',
  source_tag: 'cover-v1-final',
  source_commit: '${sourceCommit}',
  source_path: 'docs/evidence/live_evidence.json',
  synced_at: '${new Date().toISOString()}',
};

export const PROMPT_SHA256 = '${liveRaw.deployments.prompt_sha256}';

export const BALANCE_SNAPSHOTS: BalanceSnapshot[] = ${JSON.stringify(liveRaw.balance_snapshots || [], null, 2)};

export const TRANSACTION_MATRIX: TransactionEvidence[] = ${JSON.stringify(liveRaw.transactions || [], null, 2)};

export const ROBUSTNESS_ITER0: Record<string, RobustnessBatchResult> = ${JSON.stringify(normIter0, null, 2)};
export const ROBUSTNESS_ITER1: Record<string, RobustnessBatchResult> = ${JSON.stringify(normIter1, null, 2)};
export const ROBUSTNESS_ITER2: Record<string, RobustnessBatchResult> = ${JSON.stringify(normIter2, null, 2)};
export const ITER2_BATCHES: Record<string, RobustnessBatchResult> = ROBUSTNESS_ITER2;

export const FINAL_STATS = ${JSON.stringify(liveRaw.readbacks.stats || {}, null, 2)};
export const FINAL_POOL_HEALTH = ${JSON.stringify(liveRaw.readbacks.pool_health_final || {}, null, 2)};
`;


fs.writeFileSync(path.join(outDir, 'evidenceSummary.ts'), summaryCode, 'utf8');
console.log('Wrote src/data/evidenceSummary.ts');
console.log('Evidence synchronization complete.');
