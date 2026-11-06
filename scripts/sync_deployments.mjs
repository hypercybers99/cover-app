import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Contract repository source path
const contractRepoPath = process.env.CONTRACT_REPO_PATH || 'E:/Cover_V2.1';

console.log('======================================================');
console.log('SYNC DEPLOYMENTS: Source of Truth Verification (V2)');
console.log(`Contract repository path: ${contractRepoPath}`);
console.log('======================================================');

if (!fs.existsSync(contractRepoPath)) {
  console.error(`Error: Contract repository path not found at ${contractRepoPath}`);
  process.exit(1);
}

// 1. Read scripts/deploy/deployments_v2.json (or deployments.json) from contract repo
const depV2Path = path.join(contractRepoPath, 'scripts/deploy/deployments_v2.json');
const depV1Path = path.join(contractRepoPath, 'scripts/deploy/deployments.json');

const depJsonPath = fs.existsSync(depV2Path) ? depV2Path : depV1Path;
console.log(`Reading deployment JSON from: ${depJsonPath}`);
const depJson = JSON.parse(fs.readFileSync(depJsonPath, 'utf8'));

// 2. Read docs/ADDRESS_REGISTRY.md from contract repo
const regPath = path.join(contractRepoPath, 'docs/ADDRESS_REGISTRY.md');
if (!fs.existsSync(regPath)) {
  console.error(`Error: ADDRESS_REGISTRY.md not found at ${regPath}`);
  process.exit(1);
}
const regMd = fs.readFileSync(regPath, 'utf8');

// Parse active section from ADDRESS_REGISTRY.md
// Section 1 is ACTIVE Production Deployment (Cover V2 & CoverGuard V2)
const activeSectionMatch = regMd.match(/## 1\. ACTIVE Production Deployment[\s\S]*?(?=## 2\.|$)/);
if (!activeSectionMatch) {
  console.error('Error: Could not locate Section 1 (ACTIVE Production Deployment) in ADDRESS_REGISTRY.md');
  process.exit(1);
}
const activeSection = activeSectionMatch[0];

// Extract addresses from markdown
const coverAddrMatch = activeSection.match(/\*\*`Cover`\s*(?:\(V2\))?\*\*:\s*[\r\n]+\s*-\s*\*\*Address\*\*:\s*`([^`]+)`/);
const coverTxMatch = activeSection.match(/\*\*`Cover`\s*(?:\(V2\))?\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Deploy Tx\*\*:\s*`([^`]+)`/);
const coverShaMatch = activeSection.match(/\*\*`Cover`\s*(?:\(V2\))?\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Source SHA-256\*\*:\s*`([^`]+)`/);

const guardAddrMatch = activeSection.match(/\*\*`CoverGuard`\s*(?:\(V2\))?\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Address\*\*:\s*`([^`]+)`/);
const guardTxMatch = activeSection.match(/\*\*`CoverGuard`\s*(?:\(V2\))?\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Deploy Tx\*\*:\s*`([^`]+)`/);
const guardShaMatch = activeSection.match(/\*\*`CoverGuard`\s*(?:\(V2\))?\*\*:\s*[\r\n]+[\s\S]*?-\s*\*\*Source SHA-256\*\*:\s*`([^`]+)`/);

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

console.log('Values from ADDRESS_REGISTRY.md (Active V2):');
console.log('  Cover address:    ', regCover.address);
console.log('  Cover deploy tx:  ', regCover.deployTx);
console.log('  Cover source sha: ', regCover.sourceSha);
console.log('  Guard address:    ', regGuard.address);
console.log('  Guard deploy tx:  ', regGuard.deployTx);
console.log('  Guard source sha: ', regGuard.sourceSha);

console.log('\nValues from deployments_v2.json:');
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
  console.error('\nDISAGREEMENT DETECTED BETWEEN ADDRESS_REGISTRY.md AND deployments_v2.json:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('\nVERIFICATION SUCCESS: ADDRESS_REGISTRY.md and deployments_v2.json agree exactly!');

// 3. Copy contract sources into contracts/ with sha256 assertion
const srcCoverV2 = path.join(contractRepoPath, 'contracts/CoverV2.py');
const srcGuardV2 = path.join(contractRepoPath, 'contracts/CoverGuardV2.py');

if (!fs.existsSync(srcCoverV2) || !fs.existsSync(srcGuardV2)) {
  console.error(`Error: V2 contract source files not found in ${contractRepoPath}`);
  process.exit(1);
}

const coverBuf = fs.readFileSync(srcCoverV2);
const guardBuf = fs.readFileSync(srcGuardV2);

const coverSha = crypto.createHash('sha256').update(coverBuf).digest('hex');
const guardSha = crypto.createHash('sha256').update(guardBuf).digest('hex');

const EXPECTED_COVER_SHA = '0b2f91d2b64dee1dce4aa13c15c19c274546dd64fff8b738325067c37a12b296';
const EXPECTED_GUARD_SHA = 'e0546c62266e7ab13b0aaa70489ada2625849742f004cb21732aaef03cd901a1';

if (coverSha !== EXPECTED_COVER_SHA) {
  console.error(`Error: CoverV2.py sha256 mismatch! Got ${coverSha}, expected ${EXPECTED_COVER_SHA}`);
  process.exit(1);
}
if (guardSha !== EXPECTED_GUARD_SHA) {
  console.error(`Error: CoverGuardV2.py sha256 mismatch! Got ${guardSha}, expected ${EXPECTED_GUARD_SHA}`);
  process.exit(1);
}

const destContractsDir = path.join(rootDir, 'contracts');
if (!fs.existsSync(destContractsDir)) fs.mkdirSync(destContractsDir, { recursive: true });

// Write Cover.py & CoverV2.py
fs.writeFileSync(path.join(destContractsDir, 'Cover.py'), coverBuf);
fs.writeFileSync(path.join(destContractsDir, 'CoverV2.py'), coverBuf);
// Write CoverGuard.py & CoverGuardV2.py
fs.writeFileSync(path.join(destContractsDir, 'CoverGuard.py'), guardBuf);
fs.writeFileSync(path.join(destContractsDir, 'CoverGuardV2.py'), guardBuf);

console.log(`\nContract sources copied and verified:`);
console.log(`  contracts/Cover.py      sha256: ${coverSha}`);
console.log(`  contracts/CoverGuard.py sha256: ${guardSha}`);

// Generate src/config/deployments.ts
const outDir = path.join(rootDir, 'src/config');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const content = `// Generated automatically by scripts/sync_deployments.mjs
// Source of truth: cover-genlayer (tag: cover-v2)
// ADDRESS_REGISTRY.md and scripts/deploy/deployments_v2.json agreement verified.

export interface ContractDeployment {
  address: string;
  deployTx: string;
  sourceSha256: string;
  deployLatencySeconds?: string;
  explorerUrl: string;
}

export interface SupersededPair {
  version: string;
  cover: string;
  coverGuard: string;
  reason: string;
  explorerUrlCover: string;
  explorerUrlGuard: string;
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
  supersededList: SupersededPair[];
  promptSha256: string;
  parseExtractionSha256: string;
} = {
  cover: {
    address: '${depJson.addresses.cover}',
    deployTx: '${depJson.deploy_txs.cover}',
    sourceSha256: '${depJson.source_shas.cover}',
    deployLatencySeconds: '${depJson.latencies?.cover || "8.78"}',
    explorerUrl: 'https://explorer-studio.genlayer.com/address/${depJson.addresses.cover}',
  },
  coverGuard: {
    address: '${depJson.addresses.cover_guard}',
    deployTx: '${depJson.deploy_txs.cover_guard}',
    sourceSha256: '${depJson.source_shas.cover_guard}',
    deployLatencySeconds: '${depJson.latencies?.cover_guard || "5.83"}',
    explorerUrl: 'https://explorer-studio.genlayer.com/address/${depJson.addresses.cover_guard}',
  },
  superseded: {
    cover: '0x4d12d00d527869a6a6f95358A11589ecf3C347e3',
    coverGuard: '0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724',
  },
  supersededList: [
    {
      version: 'V1',
      cover: '0x4d12d00d527869a6a6f95358A11589ecf3C347e3',
      coverGuard: '0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724',
      reason: 'Superseded by V2 following reviewer alignment on purchase-time term binding and CoverGuard signature alignment.',
      explorerUrlCover: 'https://explorer-studio.genlayer.com/address/0x4d12d00d527869a6a6f95358A11589ecf3C347e3',
      explorerUrlGuard: 'https://explorer-studio.genlayer.com/address/0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724',
    },
    {
      version: 'V0',
      cover: '0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd',
      coverGuard: '0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF',
      reason: 'Initial Milestone 4 deployment, superseded by V1.',
      explorerUrlCover: 'https://explorer-studio.genlayer.com/address/0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd',
      explorerUrlGuard: 'https://explorer-studio.genlayer.com/address/0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF',
    },
  ],
  promptSha256: '${depJson.prompt_sha256 || "5a8c842c53e4329313d349afa6932672980dd1e8466af75118eeb8df010daa1d"}',
  parseExtractionSha256: '${depJson.parse_extraction_sha256 || "c44e054a7af6a9abb30fbc536895ce61532bf2edf016497d23a53ab094370978"}',
};

export const ACTIVE_DEPLOYMENTS = DEPLOYMENTS;
export const GENLAYER_STUDIONET = NETWORK;
`;

const outFile = path.join(outDir, 'deployments.ts');
fs.writeFileSync(outFile, content, 'utf8');
console.log(`Wrote deployments configuration to: ${outFile}`);
