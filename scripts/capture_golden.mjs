import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, chains } from 'genlayer-js';
import { DEPLOYMENTS, NETWORK } from '../src/config/deployments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const client = createClient({
  chain: chains.studionet,
  endpoint: NETWORK.rpcUrl,
});

const COVER_ADDRESS = DEPLOYMENTS.cover.address;
const GUARD_ADDRESS = DEPLOYMENTS.coverGuard.address;

async function main() {
  console.log('Capturing golden outputs from deployed Studionet contracts...');
  console.log('Cover:', COVER_ADDRESS);
  console.log('CoverGuard:', GUARD_ADDRESS);

  const goldenDir = path.join(rootDir, 'tests/golden');
  if (!fs.existsSync(goldenDir)) fs.mkdirSync(goldenDir, { recursive: true });

  // 1. get_product("1")
  const rawProduct = await client.readContract({
    address: COVER_ADDRESS,
    functionName: 'get_product',
    args: ['1'],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_product.json'), JSON.stringify(JSON.parse(rawProduct), null, 2));
  console.log('  Saved get_product.json');

  // 2. get_policy("1")
  const rawPolicy = await client.readContract({
    address: COVER_ADDRESS,
    functionName: 'get_policy',
    args: ['1'],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_policy.json'), JSON.stringify(JSON.parse(rawPolicy), null, 2));
  console.log('  Saved get_policy.json');

  // 3. get_settlement("1")
  const rawSettlement = await client.readContract({
    address: COVER_ADDRESS,
    functionName: 'get_settlement',
    args: ['1'],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_settlement.json'), JSON.stringify(JSON.parse(rawSettlement), null, 2));
  console.log('  Saved get_settlement.json');

  // 4. pool_health("1")
  const rawPoolHealth = await client.readContract({
    address: COVER_ADDRESS,
    functionName: 'pool_health',
    args: ['1'],
  });
  fs.writeFileSync(path.join(goldenDir, 'pool_health.json'), JSON.stringify(JSON.parse(rawPoolHealth), null, 2));
  console.log('  Saved pool_health.json');

  // 5. get_limits()
  const rawLimits = await client.readContract({
    address: COVER_ADDRESS,
    functionName: 'get_limits',
    args: [],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_limits.json'), JSON.stringify(JSON.parse(rawLimits), null, 2));
  console.log('  Saved get_limits.json');

  // 6. get_stats()
  const rawStats = await client.readContract({
    address: COVER_ADDRESS,
    functionName: 'get_stats',
    args: [],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_stats.json'), JSON.stringify(JSON.parse(rawStats), null, 2));
  console.log('  Saved get_stats.json');

  // 7. get_attestation("1")
  const rawAttestation = await client.readContract({
    address: GUARD_ADDRESS,
    functionName: 'get_attestation',
    args: ['1'],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_attestation.json'), JSON.stringify(JSON.parse(rawAttestation), null, 2));
  console.log('  Saved get_attestation.json');

  // 8. is_covered_for CoverGuard check
  // Read policy 1 to get holder, terms_hash
  const pol = JSON.parse(rawPolicy);
  const isCovered = await client.readContract({
    address: GUARD_ADDRESS,
    functionName: 'is_covered_for',
    args: [pol.holder, '1', pol.product_id, pol.terms_hash, parseInt(pol.coverage, 10)],
  });
  fs.writeFileSync(path.join(goldenDir, 'is_covered_for.json'), JSON.stringify({ result: isCovered }, null, 2));
  console.log('  Saved is_covered_for.json (result:', isCovered, ')');

  console.log('All golden JSON files captured successfully.');
}

main().catch((err) => {
  console.error('Failed to capture golden files:', err);
  process.exit(1);
});
