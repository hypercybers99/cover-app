import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const contractRepoPath = process.env.CONTRACT_REPO_PATH || 'E:/Cover_V2.1';

console.log('======================================================');
console.log('SYNC EVIDENCE: Copy Evidence with Source Tracking (V2)');
console.log(`Source repository: ${contractRepoPath}`);
console.log('======================================================');

// Get source commit sha
let sourceCommit = 'f641d80b2e3108fcd614efd8a5dd8b76270ad162';
try {
  sourceCommit = execSync(`git -C "${contractRepoPath}" rev-parse HEAD`, { encoding: 'utf8' }).trim();
} catch (e) {}

const outDir = path.join(rootDir, 'src/data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function copyWithHeader(srcRel, outName) {
  const srcFull = path.join(contractRepoPath, srcRel);
  if (!fs.existsSync(srcFull)) {
    console.warn(`Warning: source file not found: ${srcFull}`);
    return null;
  }
  const raw = fs.readFileSync(srcFull, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`Error parsing JSON from ${srcFull}`);
    return null;
  }

  const wrapped = {
    _meta: {
      source_repo: 'https://github.com/hypercybers99/cover-genlayer',
      source_tag: 'cover-v2',
      source_commit: sourceCommit,
      source_path: srcRel,
      synced_at: new Date().toISOString(),
    },
    data: data,
  };

  const outFile = path.join(outDir, outName);
  fs.writeFileSync(outFile, JSON.stringify(wrapped, null, 2), 'utf8');
  console.log(`Copied ${srcRel} -> src/data/${outName} (commit: ${sourceCommit.slice(0, 7)})`);
  return data;
}

// 1. live_evidence.json (V1)
copyWithHeader('docs/evidence/live_evidence.json', 'live_evidence.json');

// 2. evidence_v2.json (V2 scenarios S1-S5)
const v2Data = copyWithHeader('scripts/deploy/evidence_v2.json', 'evidence_v2.json');

// 3. Robustness summaries
copyWithHeader('docs/evidence/robustness/iter0/runs.json', 'robustness_iter0.json');
copyWithHeader('docs/evidence/robustness/iter1/summary.json', 'robustness_iter1.json');
copyWithHeader('docs/evidence/robustness/iter2/summary.json', 'robustness_iter2.json');

// 4. Deployments info
copyWithHeader('scripts/deploy/deployments.json', 'deployments_source.json');
copyWithHeader('scripts/deploy/deployments_v2.json', 'deployments_v2_source.json');

// 5. Generate a consolidated evidence summary module src/data/evidenceSummary.ts
const liveRaw = JSON.parse(fs.readFileSync(path.join(outDir, 'live_evidence.json'), 'utf8')).data;
const iter0Raw = JSON.parse(fs.readFileSync(path.join(outDir, 'robustness_iter0.json'), 'utf8')).data;
const iter1Raw = JSON.parse(fs.readFileSync(path.join(outDir, 'robustness_iter1.json'), 'utf8')).data;
const iter2Raw = JSON.parse(fs.readFileSync(path.join(outDir, 'robustness_iter2.json'), 'utf8')).data;
const v2Raw = v2Data || (fs.existsSync(path.join(outDir, 'evidence_v2.json')) ? JSON.parse(fs.readFileSync(path.join(outDir, 'evidence_v2.json'), 'utf8')).data : {});

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
  pool_balance?: number;
  reserved?: number;
  pool_1_balance?: number;
  pool_1_reserved?: number;
  pool_2_balance?: number;
  pool_2_reserved?: number;
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
  source_tag: 'cover-v2',
  source_commit: '${sourceCommit}',
  source_path: 'scripts/deploy/evidence_v2.json',
  synced_at: '${new Date().toISOString()}',
};

export const PROMPT_SHA256 = '5a8c842c53e4329313d349afa6932672980dd1e8466af75118eeb8df010daa1d';
export const PARSE_EXTRACTION_SHA256 = 'c44e054a7af6a9abb30fbc536895ce61532bf2edf016497d23a53ab094370978';

// V2 Scenarios S1-S5 On-chain evidence
export const TRANSACTION_MATRIX_V2: TransactionEvidence[] = ${JSON.stringify(v2Raw.transactions || [], null, 2)};
export const BALANCE_SNAPSHOTS_V2: BalanceSnapshot[] = ${JSON.stringify(v2Raw.balance_snapshots || [], null, 2)};
export const READBACKS_V2 = ${JSON.stringify(v2Raw.readbacks || {}, null, 2)};

// Backward compatible aliases
export const TRANSACTION_MATRIX = TRANSACTION_MATRIX_V2;
export const BALANCE_SNAPSHOTS = BALANCE_SNAPSHOTS_V2;

export const ROBUSTNESS_ITER0: Record<string, RobustnessBatchResult> = ${JSON.stringify(normIter0, null, 2)};
export const ROBUSTNESS_ITER1: Record<string, RobustnessBatchResult> = ${JSON.stringify(normIter1, null, 2)};
export const ROBUSTNESS_ITER2: Record<string, RobustnessBatchResult> = ${JSON.stringify(normIter2, null, 2)};
export const ITER2_BATCHES: Record<string, RobustnessBatchResult> = ROBUSTNESS_ITER2;

export const FINAL_STATS = ${JSON.stringify(v2Raw.readbacks?.final_stats || liveRaw.readbacks?.stats || {}, null, 2)};
export const FINAL_POOL_HEALTH = ${JSON.stringify(v2Raw.readbacks?.pool_health_1_after_funding || liveRaw.readbacks?.pool_health_final || {}, null, 2)};
`;

fs.writeFileSync(path.join(outDir, 'evidenceSummary.ts'), summaryCode, 'utf8');
console.log('Wrote src/data/evidenceSummary.ts');
console.log('Evidence synchronization complete.');
