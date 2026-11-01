import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function fetchDeployPayload(txHash) {
  const res = await fetch('https://studio.genlayer.com/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [txHash],
      id: 1,
    }),
  });
  const data = await res.json();
  const b64 = data.result?.data?.contract_code;
  if (!b64) throw new Error(`contract_code missing from tx ${txHash}`);
  return Buffer.from(b64, 'base64');
}

async function main() {
  console.log('======================================================');
  console.log('VERIFY CONTRACTS: Byte-for-Byte Fidelity Check');
  console.log('======================================================');

  // Read config
  const depConfigPath = path.join(rootDir, 'src/config/deployments.ts');
  const depCode = fs.readFileSync(depConfigPath, 'utf8');

  // Extract sha from config
  const coverShaMatch = depCode.match(/cover:\s*\{[\s\S]*?sourceSha256:\s*'([a-f0-9]{64})'/);
  const guardShaMatch = depCode.match(/coverGuard:\s*\{[\s\S]*?sourceSha256:\s*'([a-f0-9]{64})'/);
  const coverTxMatch = depCode.match(/cover:\s*\{[\s\S]*?deployTx:\s*'(0x[a-f0-9]{64})'/i);
  const guardTxMatch = depCode.match(/coverGuard:\s*\{[\s\S]*?deployTx:\s*'(0x[a-f0-9]{64})'/i);

  const configCoverSha = coverShaMatch[1];
  const configGuardSha = guardShaMatch[1];
  const coverTx = coverTxMatch[1];
  const guardTx = guardTxMatch[1];

  // Read local files
  const coverLocalPath = path.join(rootDir, 'contracts/Cover.py');
  const guardLocalPath = path.join(rootDir, 'contracts/CoverGuard.py');

  const coverLocalBuf = fs.readFileSync(coverLocalPath);
  const guardLocalBuf = fs.readFileSync(guardLocalPath);

  const localCoverSha = crypto.createHash('sha256').update(coverLocalBuf).digest('hex');
  const localGuardSha = crypto.createHash('sha256').update(guardLocalBuf).digest('hex');

  console.log('\n--- 1. Local File Hashes ---');
  console.log(`Cover.py local SHA-256:      ${localCoverSha}`);
  console.log(`  Starts with a1f8ceb8:      ${localCoverSha.startsWith('a1f8ceb8')}`);
  console.log(`  Matches deployments.ts:    ${localCoverSha === configCoverSha}`);

  console.log(`CoverGuard.py local SHA-256: ${localGuardSha}`);
  console.log(`  Starts with b2682e9e:      ${localGuardSha.startsWith('b2682e9e')}`);
  console.log(`  Matches deployments.ts:    ${localGuardSha === configGuardSha}`);

  if (!localCoverSha.startsWith('a1f8ceb8') || localCoverSha !== configCoverSha) {
    console.error('FAILED: Cover.py hash assertion failure!');
    process.exit(1);
  }
  if (!localGuardSha.startsWith('b2682e9e') || localGuardSha !== configGuardSha) {
    console.error('FAILED: CoverGuard.py hash assertion failure!');
    process.exit(1);
  }

  console.log('\n--- 2. On-Chain Deployed Payloads ---');
  console.log(`Fetching Cover deploy payload from tx: ${coverTx}...`);
  const onchainCoverBuf = await fetchDeployPayload(coverTx);
  const onchainCoverSha = crypto.createHash('sha256').update(onchainCoverBuf).digest('hex');
  const coverMatch = onchainCoverBuf.equals(coverLocalBuf);

  console.log(`  Deployed byte length:      ${onchainCoverBuf.length}`);
  console.log(`  Local byte length:         ${coverLocalBuf.length}`);
  console.log(`  First 16 bytes:            ${onchainCoverBuf.subarray(0, 16).toString('hex')}`);
  console.log(`  Last 16 bytes:             ${onchainCoverBuf.subarray(onchainCoverBuf.length - 16).toString('hex')}`);
  console.log(`  On-chain SHA-256:          ${onchainCoverSha}`);
  console.log(`  Byte-for-byte match:       ${coverMatch}`);

  console.log(`\nFetching CoverGuard deploy payload from tx: ${guardTx}...`);
  const onchainGuardBuf = await fetchDeployPayload(guardTx);
  const onchainGuardSha = crypto.createHash('sha256').update(onchainGuardBuf).digest('hex');
  const guardMatch = onchainGuardBuf.equals(guardLocalBuf);

  console.log(`  Deployed byte length:      ${onchainGuardBuf.length}`);
  console.log(`  Local byte length:         ${guardLocalBuf.length}`);
  console.log(`  First 16 bytes:            ${onchainGuardBuf.subarray(0, 16).toString('hex')}`);
  console.log(`  Last 16 bytes:             ${onchainGuardBuf.subarray(onchainGuardBuf.length - 16).toString('hex')}`);
  console.log(`  On-chain SHA-256:          ${onchainGuardSha}`);
  console.log(`  Byte-for-byte match:       ${guardMatch}`);

  if (!coverMatch || !guardMatch) {
    console.error('\nFAILED: Local contract files do not equal deployed on-chain payloads byte-for-byte!');
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('CONTRACT VERIFICATION SUCCESSFUL: Byte-for-byte identical match confirmed!');
  console.log('======================================================');
}

main().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
