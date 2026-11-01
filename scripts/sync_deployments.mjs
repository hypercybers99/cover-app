import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Contract repository source path
const contractRepoPath = process.env.CONTRACT_REPO_PATH || 'E:/Cover_V2.1';

console.log('======================================================');
console.log('SYNC DEPLOYMENTS: Source of Truth Verification');
console.log(`Contract repository path: ${contractRepoPath}`);
console.log('======================================================');

if (!fs.existsSync(contractRepoPath)) {
  console.error(`Error: Contract repository path not found at ${contractRepoPath}`);
  process.exit(1);
}

// 1. Read scripts/deploy/deployments.json from contract repo
const depJsonPath = path.join(contractRepoPath, 'scripts/deploy/deployments.json');
if (!fs.existsSync(depJsonPath)) {
  console.error(`Error: deployments.json not found at ${depJsonPath}`);
  process.exit(1);
}
const depJson = JSON.parse(fs.readFileSync(depJsonPath, 'utf8'));

// 2. Read docs/ADDRESS_REGISTRY.md from contract repo
const regPath = path.join(contractRepoPath, 'docs/ADDRESS_REGISTRY.md');
if (!fs.existsSync(regPath)) {
  console.error(`Error: ADDRESS_REGISTRY.md not found at ${regPath}`);
  process.exit(1);
}
const regMd = fs.readFileSync(regPath, 'utf8');

// Parse active section from ADDRESS_REGISTRY.md
// Section 1 is ACTIVE Production Deployment
const activeSectionMatch = regMd.match(/## 1\. ACTIVE Production Deployment[\s\S]*?(?=## 2\.|$)/);
if (!activeSectionMatch) {
  console.error('Error: Could not locate Section 1 (ACTIVE Production Deployment) in ADDRESS_REGISTRY.md');
  process.exit(1);
}
const activeSection = activeSectionMatch[0];

// Extract addresses from markdown
const coverAddrMatch = activeSection.match(/\*\*`Cover`\*\*:\s*[\r\n]+\s*-\s*\*\*Address\*\*:\s*`([^`]+)`/);
const coverTxMatch = activeSection.match(/\*\*`Cover`\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Deploy Tx\*\*:\s*`([^`]+)`/);
const coverShaMatch = activeSection.match(/\*\*`Cover`\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Source SHA-256\*\*:\s*`([^`]+)`/);

const guardAddrMatch = activeSection.match(/\*\*`CoverGuard`\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Address\*\*:\s*`([^`]+)`/);
const guardTxMatch = activeSection.match(/\*\*`CoverGuard`\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Deploy Tx\*\*:\s*`([^`]+)`/);
const guardShaMatch = activeSection.match(/\*\*`CoverGuard`\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Source SHA-256\*\*:\s*`([^`]+)`/);

if (!coverAddrMatch || !coverTxMatch || !guardAddrMatch || !guardTxMatch) {
  console.error('Error: Failed to parse active contract entries from ADDRESS_REGISTRY.md');
  process.exit(1);
}

const regCover = {
  address: coverAddrMatch[1].trim(),
  deployTx: coverTxMatch[1].trim(),
  sourceSha: coverShaMatch ? coverShaMatch[1].trim() : '',
};

const regGuard = {
  address: guardAddrMatch[1].trim(),
  deployTx: guardTxMatch[1].trim(),
  sourceSha: guardShaMatch ? guardShaMatch[1].trim() : '',
};

console.log('Values from ADDRESS_REGISTRY.md:');
console.log('  Cover address:    ', regCover.address);
console.log('  Cover deploy tx:  ', regCover.deployTx);
console.log('  Cover source sha: ', regCover.sourceSha);
console.log('  Guard address:    ', regGuard.address);
console.log('  Guard deploy tx:  ', regGuard.deployTx);
console.log('  Guard source sha: ', regGuard.sourceSha);

console.log('\nValues from deployments.json:');
console.log('  Cover address:    ', depJson.addresses.cover);
console.log('  Cover deploy tx:  ', depJson.deploy_txs.cover);
console.log('  Cover source sha: ', depJson.source_shas.cover);
console.log('  Guard address:    ', depJson.addresses.cover_guard);
console.log('  Guard deploy tx:  ', depJson.deploy_txs.cover_guard);
console.log('  Guard source sha: ', depJson.source_shas.cover_guard);

// Compare values
const errors = [];
if (regCover.address.toLowerCase() !== depJson.addresses.cover.toLowerCase()) {
  errors.push(`Cover address mismatch: registry (${regCover.address}) != json (${depJson.addresses.cover})`);
}
if (regCover.deployTx.toLowerCase() !== depJson.deploy_txs.cover.toLowerCase()) {
  errors.push(`Cover deploy tx mismatch: registry (${regCover.deployTx}) != json (${depJson.deploy_txs.cover})`);
}
if (regCover.sourceSha && regCover.sourceSha.toLowerCase() !== depJson.source_shas.cover.toLowerCase()) {
  errors.push(`Cover source sha mismatch: registry (${regCover.sourceSha}) != json (${depJson.source_shas.cover})`);
}
if (regGuard.address.toLowerCase() !== depJson.addresses.cover_guard.toLowerCase()) {
  errors.push(`CoverGuard address mismatch: registry (${regGuard.address}) != json (${depJson.addresses.cover_guard})`);
}
if (regGuard.deployTx.toLowerCase() !== depJson.deploy_txs.cover_guard.toLowerCase()) {
  errors.push(`CoverGuard deploy tx mismatch: registry (${regGuard.deployTx}) != json (${depJson.deploy_txs.cover_guard})`);
}
if (regGuard.sourceSha && regGuard.sourceSha.toLowerCase() !== depJson.source_shas.cover_guard.toLowerCase()) {
  errors.push(`CoverGuard source sha mismatch: registry (${regGuard.sourceSha}) != json (${depJson.source_shas.cover_guard})`);
}

if (errors.length > 0) {
  console.error('\nDISAGREEMENT DETECTED BETWEEN ADDRESS_REGISTRY.md AND deployments.json:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('\nVERIFICATION SUCCESS: ADDRESS_REGISTRY.md and deployments.json agree exactly!');

// Generate src/config/deployments.ts
const outDir = path.join(rootDir, 'src/config');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const content = `// Generated automatically by scripts/sync_deployments.mjs
// Source of truth: cover-genlayer (tag: cover-v1-final)
// ADDRESS_REGISTRY.md and scripts/deploy/deployments.json agreement verified.

export interface ContractDeployment {
  address: string;
  deployTx: string;
  sourceSha256: string;
  deployLatencySeconds?: string;
  explorerUrl: string;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
}

export const NETWORK: NetworkConfig = {
  name: 'GenLayer Studionet',
  chainId: 61999,
  rpcUrl: 'https://studio.genlayer.com/api',
  explorerUrl: 'https://explorer-studio.genlayer.com',
};

export const DEPLOYMENTS: {
  cover: ContractDeployment;
  coverGuard: ContractDeployment;
  superseded: {
    cover: string;
    coverGuard: string;
  };
  promptSha256: string;
} = {
  cover: {
    address: '${depJson.addresses.cover}',
    deployTx: '${depJson.deploy_txs.cover}',
    sourceSha256: '${depJson.source_shas.cover}',
    deployLatencySeconds: '${depJson.latencies?.cover || "10.62"}',
    explorerUrl: 'https://explorer-studio.genlayer.com/address/${depJson.addresses.cover}',
  },
  coverGuard: {
    address: '${depJson.addresses.cover_guard}',
    deployTx: '${depJson.deploy_txs.cover_guard}',
    sourceSha256: '${depJson.source_shas.cover_guard}',
    deployLatencySeconds: '${depJson.latencies?.cover_guard || "9.53"}',
    explorerUrl: 'https://explorer-studio.genlayer.com/address/${depJson.addresses.cover_guard}',
  },
  superseded: {
    cover: '0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd',
    coverGuard: '0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF',
  },
  promptSha256: '${depJson.prompt_sha256 || "90be3b95dd867b8cc3a04f9464e3a1ab3b499343d3c4a40664042651092ecca1"}',
};
`;

const outFile = path.join(outDir, 'deployments.ts');
fs.writeFileSync(outFile, content, 'utf8');
console.log(`Wrote deployments configuration to: ${outFile}`);
