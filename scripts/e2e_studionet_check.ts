import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, chains, createAccount } from 'genlayer-js';
import { DEPLOYMENTS, NETWORK } from '../src/config/deployments';
import { classifyReceipt } from '../src/lib/receipts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  console.log('======================================================');
  console.log('E2E STUDIONET ON-CHAIN VALIDATION');
  console.log('======================================================');

  const envPath = path.join(rootDir, '.env');
  let privateKey: string | null = null;

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/E2E_PRIVATE_KEY=([^\r\n]+)/);
    if (match) {
      privateKey = match[1].trim();
    }
  }

  let account: any;
  if (privateKey) {
    console.log('Loaded throwaway key from local .env');
    account = createAccount(privateKey as `0x${string}`);
  } else {
    console.log('Generating fresh throwaway key...');
    account = createAccount();
    fs.appendFileSync(envPath, `\nE2E_PRIVATE_KEY=${account.privateKey}\n`, 'utf8');
    console.log('Stored throwaway key in git-ignored .env');
  }

  console.log(`Throwaway Test Address: ${account.address}`);
  console.log(`Studionet RPC:           ${NETWORK.rpcUrl}`);
  console.log(`Cover Contract:          ${DEPLOYMENTS.cover.address}`);

  const client = createClient({
    chain: chains.studionet,
    endpoint: NETWORK.rpcUrl,
    account: account,
  });

  // 1. Read balance before
  console.log('\nReading initial demo credit balance...');
  const balBeforeRaw = await client.readContract({
    address: DEPLOYMENTS.cover.address as `0x${string}`,
    functionName: 'balance_of',
    args: [account.address],
  });
  const balBefore = parseInt(String(balBeforeRaw || '0'), 10);
  console.log(`Balance before: ${balBefore} CR`);

  // 2. Claim demo credits
  console.log('\nSubmitting claim_demo_credits transaction...');
  const t0 = Date.now();
  const txHash = await client.writeContract({
    address: DEPLOYMENTS.cover.address as `0x${string}`,
    functionName: 'claim_demo_credits',
    args: [],
    value: 0n,
  });
  console.log(`Transaction submitted: ${txHash}`);
  console.log('Waiting for receipt from studionet consensus validators...');

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    retries: 150,
    interval: 3500,
  });
  const elapsed = parseFloat(((Date.now() - t0) / 1000).toFixed(2));
  console.log(`Receipt received in ${elapsed}s: status=${receipt.status_name}, result=${receipt.result_name}`);

  const check = classifyReceipt(receipt);
  console.log(`Receipt classification: ${check.classification} (${check.summary})`);

  // 3. Read balance after
  const balAfterRaw = await client.readContract({
    address: DEPLOYMENTS.cover.address as `0x${string}`,
    functionName: 'balance_of',
    args: [account.address],
  });
  const balAfter = parseInt(String(balAfterRaw || '0'), 10);
  console.log(`Balance after: ${balAfter} CR`);

  const delta = balAfter - balBefore;
  console.log(`Balance delta: +${delta} CR`);

  if (delta !== 1000) {
    throw new Error(`Expected balance increment of 1000 CR, received ${delta}`);
  }

  // 4. Save evidence to docs/e2e
  const e2eDir = path.join(rootDir, 'docs/e2e');
  if (!fs.existsSync(e2eDir)) fs.mkdirSync(e2eDir, { recursive: true });

  const record = {
    timestamp: new Date().toISOString(),
    account: account.address,
    action: 'claim_demo_credits',
    txHash,
    elapsedSeconds: elapsed,
    status_name: receipt.status_name,
    result_name: receipt.result_name,
    leader_result: receipt.consensus_data?.leader_receipt?.[0]?.execution_result || 'UNKNOWN',
    balanceBefore: balBefore,
    balanceAfter: balAfter,
    delta: delta,
    verified: true,
  };

  const outFile = path.join(e2eDir, 'e2e_studionet_receipt.json');
  fs.writeFileSync(outFile, JSON.stringify(record, null, 2), 'utf8');
  console.log(`\nSaved on-chain E2E receipt to: docs/e2e/e2e_studionet_receipt.json`);
  console.log('PASS: On-chain interaction verified on live studionet!');
}

main().catch((err) => {
  console.error('E2E on-chain check failed:', err);
  process.exit(1);
});
