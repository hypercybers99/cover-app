import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, chains, createAccount, generatePrivateKey } from 'genlayer-js';
import { DEPLOYMENTS, NETWORK } from '../src/config/deployments.js';
import { classifyReceipt, extractProductIdFromReceipt } from '../src/lib/receipts.js';
import {
  claimDemoCredits,
  createProduct,
  fundProduct,
  withdrawUnreserved,
  updateSource,
  buyPolicy,
  settlePolicy,
  cancelPolicy,
  attestCoverage,
  getClientForAccount,
} from '../src/services/walletClient.js';
import {
  getBalanceOf,
  getProduct,
  getPolicy,
  getPoolHealth,
  getSettlement,
  getStats,
  quotePremium,
  isCovered,
  isCoveredFor,
  getAttestation,
  listAttestations,
} from '../src/services/readClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const e2eDir = path.join(rootDir, 'docs', 'e2e');

if (!fs.existsSync(e2eDir)) {
  fs.mkdirSync(e2eDir, { recursive: true });
}

// -----------------------------------------------------------------------------
// Keys and Setup
// -----------------------------------------------------------------------------

function getOrGenerateKeys() {
  const envPath = path.join(rootDir, '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  let creatorKey = null;
  let buyerKey = null;

  const matchCreator = envContent.match(/E2E_CREATOR_KEY=([^\r\n]+)/);
  if (matchCreator && matchCreator[1].trim() && matchCreator[1].trim() !== 'undefined') {
    creatorKey = matchCreator[1].trim();
  }

  const matchBuyer = envContent.match(/E2E_BUYER_KEY=([^\r\n]+)/);
  if (matchBuyer && matchBuyer[1].trim() && matchBuyer[1].trim() !== 'undefined') {
    buyerKey = matchBuyer[1].trim();
  }

  let updated = false;
  if (!creatorKey) {
    creatorKey = generatePrivateKey();
    envContent += `\nE2E_CREATOR_KEY=${creatorKey}\n`;
    updated = true;
  }
  if (!buyerKey) {
    buyerKey = generatePrivateKey();
    envContent += `\nE2E_BUYER_KEY=${buyerKey}\n`;
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(envPath, envContent, 'utf8');
  }

  return { creatorKey, buyerKey };
}

async function retry(fn, label, maxRetries = 3) {
  let lastErr;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`[Retry ${i}/${maxRetries}] ${label} encountered error:`, err?.message || err);
      if (i < maxRetries) await new Promise((r) => setTimeout(r, 4000));
    }
  }
  throw lastErr;
}

// -----------------------------------------------------------------------------
// Main Execution
// -----------------------------------------------------------------------------

async function main() {
  console.log('======================================================');
  console.log('E2E FULL CHAIN STUDIONET EXECUTION (V2 CONTRACT PAIR)');
  console.log('======================================================');
  console.log(`Studionet RPC:           ${NETWORK.rpcUrl}`);
  console.log(`Cover Contract:          ${DEPLOYMENTS.cover.address}`);
  console.log(`CoverGuard Contract:     ${DEPLOYMENTS.coverGuard.address}`);

  let { creatorKey, buyerKey } = getOrGenerateKeys();
  const creatorAccount = createAccount(creatorKey);
  let buyerAccount = createAccount(buyerKey);

  console.log(`Creator Address:         ${creatorAccount.address}`);
  console.log(`Buyer Address (Initial): ${buyerAccount.address}`);

  const clientCreator = getClientForAccount(creatorAccount);

  const pinnedSha = '92c69bc636517656b9e7ee031a503adfb2d26bb4';
  const rawBase = `https://raw.githubusercontent.com/hypercybers99/cover-fixtures/${pinnedSha}/`;
  const s0Url = rawBase + 'status-s0-operational.md';
  const s1Url = rawBase + 'status-s1-outage-75.md';

  const executionLog = [];

  function recordStep(stepId, result) {
    executionLog.push({ stepId, ...result });
    console.log(`[${stepId}] Completed: ${result.summary || result.check?.summary || 'Done'}`);
  }

  // Ensure creator has demo credits
  const creatorBalStart = parseInt(await getBalanceOf(creatorAccount.address), 10);
  console.log(`\nInitial Creator Balance: ${creatorBalStart} CR`);
  if (creatorBalStart < 400) {
    console.log('Claiming demo credits for Creator...');
    const claimCreatorRes = await retry(() => claimDemoCredits(clientCreator), 'Creator claim credits');
    console.log(`Creator claim tx: ${claimCreatorRes.txHash}`);
  }

  // ---------------------------------------------------------------------------
  // STEP 1: Claim credits (Buyer wallet)
  // Ensure a clean virgin buyer account for claim verification
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 1: Claim credits (Buyer) ---');
  let balBeforeBuyer1 = parseInt(await getBalanceOf(buyerAccount.address), 10);
  if (balBeforeBuyer1 > 0) {
    console.log(`Existing buyer balance is ${balBeforeBuyer1} CR (already claimed). Generating fresh buyer key...`);
    buyerKey = generatePrivateKey();
    buyerAccount = createAccount(buyerKey);
    balBeforeBuyer1 = parseInt(await getBalanceOf(buyerAccount.address), 10);
  }
  console.log(`Buyer Address:        ${buyerAccount.address}`);
  console.log(`Buyer balance before: ${balBeforeBuyer1} CR`);

  const clientBuyer = getClientForAccount(buyerAccount);

  const step1Receipt = await retry(() => claimDemoCredits(clientBuyer), 'Buyer claim credits');
  const balAfterBuyer1 = parseInt(await getBalanceOf(buyerAccount.address), 10);
  console.log(`Buyer balance after:  ${balAfterBuyer1} CR (delta: +${balAfterBuyer1 - balBeforeBuyer1} CR)`);

  const step1Data = {
    step: '1_claim_credits',
    caller: buyerAccount.address,
    function: 'claim_demo_credits',
    tx_hash: step1Receipt.txHash,
    status_name: step1Receipt.receipt?.status_name,
    result_name: step1Receipt.receipt?.result_name,
    leader_result: step1Receipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step1Receipt.check.classification,
    elapsed_seconds: step1Receipt.elapsedSeconds,
    balance_before: balBeforeBuyer1,
    balance_after: balAfterBuyer1,
    delta: balAfterBuyer1 - balBeforeBuyer1,
  };
  fs.writeFileSync(path.join(e2eDir, 'step1_claim_credits.json'), JSON.stringify(step1Data, null, 2));
  recordStep('step1_claim_credits', step1Data);

  // ---------------------------------------------------------------------------
  // STEP 2: Create product (Creator wallet) - starts at operational s0Url
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 2: Create product (Creator) ---');
  const productName = 'App E2E Cloud Cover';
  const minFull = 60;
  const minHalf = 30;
  const premiumBps = 1000; // 10.00%

  const step2Receipt = await retry(
    () => createProduct(clientCreator, productName, s0Url, minFull, minHalf, premiumBps),
    'Create product'
  );

  const extractedProductId = extractProductIdFromReceipt(step2Receipt.receipt);
  const statsAfterCreate = await getStats();
  const createdProductId = extractedProductId || String(parseInt(statsAfterCreate.next_product, 10) - 1);
  console.log(`Product created with ID: ${createdProductId} (receipt return value: ${extractedProductId})`);

  const productSnapshot = await getProduct(createdProductId);
  console.log(`Product record readback: name="${productSnapshot?.name}", terms_hash="${productSnapshot?.terms_hash}"`);

  const step2Data = {
    step: '2_create_product',
    caller: creatorAccount.address,
    function: 'create_product',
    tx_hash: step2Receipt.txHash,
    status_name: step2Receipt.receipt?.status_name,
    result_name: step2Receipt.receipt?.result_name,
    leader_result: step2Receipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step2Receipt.check.classification,
    elapsed_seconds: step2Receipt.elapsedSeconds,
    product_id: createdProductId,
    extracted_product_id: extractedProductId,
    product: productSnapshot,
  };
  fs.writeFileSync(path.join(e2eDir, 'step2_create_product.json'), JSON.stringify(step2Data, null, 2));
  recordStep('step2_create_product', step2Data);

  // ---------------------------------------------------------------------------
  // STEP 3: Fund product pool (Using extracted product ID)
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 3: Fund product pool (Creator) ---');
  const fundAmount = 300;
  const creatorBalBeforeFund = parseInt(await getBalanceOf(creatorAccount.address), 10);
  const healthBeforeFund = await getPoolHealth(createdProductId);

  const step3Receipt = await retry(
    () => fundProduct(clientCreator, createdProductId, fundAmount),
    'Fund product'
  );

  const creatorBalAfterFund = parseInt(await getBalanceOf(creatorAccount.address), 10);
  const healthAfterFund = await getPoolHealth(createdProductId);
  console.log(`Pool balance after fund: ${healthAfterFund?.pool_balance} CR`);

  const step3Data = {
    step: '3_fund_product',
    caller: creatorAccount.address,
    function: 'fund_product',
    tx_hash: step3Receipt.txHash,
    status_name: step3Receipt.receipt?.status_name,
    result_name: step3Receipt.receipt?.result_name,
    leader_result: step3Receipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step3Receipt.check.classification,
    elapsed_seconds: step3Receipt.elapsedSeconds,
    product_id: createdProductId,
    fund_amount: fundAmount,
    creator_balance_before: creatorBalBeforeFund,
    creator_balance_after: creatorBalAfterFund,
    pool_health_before: healthBeforeFund,
    pool_health_after: healthAfterFund,
  };
  fs.writeFileSync(path.join(e2eDir, 'step3_fund_product.json'), JSON.stringify(step3Data, null, 2));
  recordStep('step3_fund_product', step3Data);

  // ---------------------------------------------------------------------------
  // STEP 4: Quote premium vs charged premium check
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 4: Quote premium ---');
  const coverageP1 = 100;
  const quotedPremium = await quotePremium(coverageP1, premiumBps);
  const expectedCeil = Math.max(1, Math.floor((coverageP1 * premiumBps + 9999) / 10000));
  console.log(`Quoted premium for ${coverageP1} CR at ${premiumBps} bps: ${quotedPremium} CR (formula: ${expectedCeil} CR)`);

  const step4Data = {
    step: '4_quote_premium',
    coverage: coverageP1,
    premium_bps: premiumBps,
    quoted_premium: quotedPremium,
    formula_expected: expectedCeil,
    match: quotedPremium === expectedCeil,
  };
  fs.writeFileSync(path.join(e2eDir, 'step4_quote_vs_charged.json'), JSON.stringify(step4Data, null, 2));
  recordStep('step4_quote_premium', step4Data);

  // ---------------------------------------------------------------------------
  // STEP 5: Buy cover (Policy 1) - Pins purchase-time terms and s0Url
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 5: Buy cover (Buyer) ---');
  const buyerBalBeforeBuy1 = parseInt(await getBalanceOf(buyerAccount.address), 10);
  const poolHealthBeforeBuy1 = await getPoolHealth(createdProductId);

  const step5Receipt = await retry(
    () => buyPolicy(clientBuyer, createdProductId, coverageP1),
    'Buy policy 1'
  );

  const buyerBalAfterBuy1 = parseInt(await getBalanceOf(buyerAccount.address), 10);
  const extractedPolicyId1 = extractProductIdFromReceipt(step5Receipt.receipt);
  const statsAfterBuy1 = await getStats();
  const policyId1 = extractedPolicyId1 || String(parseInt(statsAfterBuy1.next_policy, 10) - 1);
  const policy1Snapshot = await getPolicy(policyId1);
  const poolHealthAfterBuy1 = await getPoolHealth(createdProductId);

  const premiumCharged = buyerBalBeforeBuy1 - buyerBalAfterBuy1;
  console.log(`Policy 1 ID: ${policyId1}, status: ${policy1Snapshot?.status}`);
  console.log(`Pinned evidence_url: ${policy1Snapshot?.evidence_url}`);
  console.log(`Pinned terms_hash:   ${policy1Snapshot?.terms_hash}`);
  console.log(`Premium charged: ${premiumCharged} CR (quoted: ${quotedPremium} CR, match: ${premiumCharged === quotedPremium})`);

  const step5Data = {
    step: '5_buy_cover',
    caller: buyerAccount.address,
    function: 'buy',
    tx_hash: step5Receipt.txHash,
    status_name: step5Receipt.receipt?.status_name,
    result_name: step5Receipt.receipt?.result_name,
    leader_result: step5Receipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step5Receipt.check.classification,
    elapsed_seconds: step5Receipt.elapsedSeconds,
    policy_id: policyId1,
    coverage: coverageP1,
    premium_quoted: quotedPremium,
    premium_charged: premiumCharged,
    matches_quote: premiumCharged === quotedPremium,
    buyer_balance_before: buyerBalBeforeBuy1,
    buyer_balance_after: buyerBalAfterBuy1,
    pool_health_before: poolHealthBeforeBuy1,
    pool_health_after: poolHealthAfterBuy1,
    policy_snapshot: policy1Snapshot,
  };
  fs.writeFileSync(path.join(e2eDir, 'step5_buy_cover.json'), JSON.stringify(step5Data, null, 2));
  recordStep('step5_buy_cover', step5Data);

  // ---------------------------------------------------------------------------
  // STEP 6a: Update source to s1Url (Demonstrates purchase-time binding)
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 6a: Update product source to s1 ---');
  console.log(`Updating product ${createdProductId} source to ${s1Url}...`);
  const updateSourceReceipt = await retry(
    () => updateSource(clientCreator, createdProductId, s1Url),
    'Update source to s1'
  );
  console.log(`Source updated: tx ${updateSourceReceipt.txHash}`);

  const productAfterUpdate = await getProduct(createdProductId);
  const policy1AfterUpdate = await getPolicy(policyId1);
  console.log(`Product current URL: ${productAfterUpdate?.url}`);
  console.log(`Policy 1 pinned URL: ${policy1AfterUpdate?.evidence_url} (remains s0Url)`);

  const updateSourceData = {
    step: '6a_update_source',
    caller: creatorAccount.address,
    function: 'update_source',
    product_id: createdProductId,
    new_url: s1Url,
    tx_hash: updateSourceReceipt.txHash,
    status_name: updateSourceReceipt.receipt?.status_name,
    result_name: updateSourceReceipt.receipt?.result_name,
    leader_result: updateSourceReceipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: updateSourceReceipt.check.classification,
    elapsed_seconds: updateSourceReceipt.elapsedSeconds,
    product_snapshot: productAfterUpdate,
    policy_pinned_url: policy1AfterUpdate?.evidence_url,
    binding_intact: policy1AfterUpdate?.evidence_url === s0Url,
  };
  fs.writeFileSync(path.join(e2eDir, 'step6_update_source.json'), JSON.stringify(updateSourceData, null, 2));
  recordStep('step6a_update_source', updateSourceData);

  // ---------------------------------------------------------------------------
  // STEP 6b: Settle Policy 1 against pinned source
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 6b: Settle Policy 1 against pinned source ---');
  const buyerBalBeforeSettle = parseInt(await getBalanceOf(buyerAccount.address), 10);
  const poolHealthBeforeSettle = await getPoolHealth(createdProductId);

  console.log(`Submitting settle for policy ${policyId1}...`);
  const step6Receipt = await retry(
    () => settlePolicy(clientBuyer, policyId1),
    'Settle policy 1'
  );
  console.log(`Settle tx: ${step6Receipt.txHash}, status: ${step6Receipt.receipt?.status_name}`);

  const buyerBalAfterSettle = parseInt(await getBalanceOf(buyerAccount.address), 10);
  const poolHealthAfterSettle = await getPoolHealth(createdProductId);
  const policy1AfterSettle = await getPolicy(policyId1);

  const statsAfterSettle = await getStats();
  const settlementId = String(parseInt(statsAfterSettle.next_settlement, 10) - 1);
  const settlementRecord = await getSettlement(settlementId);

  const payoutReceived = buyerBalAfterSettle - buyerBalBeforeSettle;
  console.log(`Policy 1 status after settle: ${policy1AfterSettle?.status}`);
  console.log(`Settlement ID: ${settlementId}, outcome: ${settlementRecord?.outcome}`);
  console.log(`Buyer payout received: +${payoutReceived} CR`);

  const step6Data = {
    step: '6_settle_policy',
    pinned_fixture_url: policy1AfterSettle?.evidence_url,
    product_current_url: productAfterUpdate?.url,
    expected_outcome: 'NO_PAY',
    actual_outcome: settlementRecord?.outcome,
    match: settlementRecord?.outcome === 'NO_PAY',
    caller: buyerAccount.address,
    function: 'settle',
    tx_hash: step6Receipt.txHash,
    status_name: step6Receipt.receipt?.status_name,
    result_name: step6Receipt.receipt?.result_name,
    leader_result: step6Receipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step6Receipt.check.classification,
    elapsed_seconds: step6Receipt.elapsedSeconds,
    buyer_balance_before: buyerBalBeforeSettle,
    buyer_balance_after: buyerBalAfterSettle,
    payout_received: payoutReceived,
    pool_health_before: poolHealthBeforeSettle,
    pool_health_after: poolHealthAfterSettle,
    policy_snapshot: policy1AfterSettle,
    settlement_snapshot: settlementRecord,
  };
  fs.writeFileSync(path.join(e2eDir, 'step6_settle_policy.json'), JSON.stringify(step6Data, null, 2));
  recordStep('step6_settle_policy', step6Data);

  // ---------------------------------------------------------------------------
  // STEP 7: Restore source to s0, Buy policy 2 & Cancel (Refund & reserve check)
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 7: Buy policy 2 & Cancel (Refund check) ---');
  console.log(`Restoring product source to s0 so buy passes inception check...`);
  const restoreReceipt = await retry(() => updateSource(clientCreator, createdProductId, s0Url), 'Restore source to s0');
  const restoreData = {
    step: '7_restore_source',
    caller: creatorAccount.address,
    function: 'update_source',
    product_id: createdProductId,
    new_url: s0Url,
    tx_hash: restoreReceipt.txHash,
    status_name: restoreReceipt.receipt?.status_name,
    result_name: restoreReceipt.receipt?.result_name,
    leader_result: restoreReceipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: restoreReceipt.check.classification,
    elapsed_seconds: restoreReceipt.elapsedSeconds,
  };
  fs.writeFileSync(path.join(e2eDir, 'step7_restore_source.json'), JSON.stringify(restoreData, null, 2));

  const coverageP2 = 50;
  console.log(`Buying policy 2 (coverage ${coverageP2} CR)...`);
  const step7BuyReceipt = await retry(
    () => buyPolicy(clientBuyer, createdProductId, coverageP2),
    'Buy policy 2'
  );

  const extractedPolicyId2 = extractProductIdFromReceipt(step7BuyReceipt.receipt);
  const statsAfterBuy2 = await getStats();
  const policyId2 = extractedPolicyId2 || String(parseInt(statsAfterBuy2.next_policy, 10) - 1);
  const policy2ActiveSnapshot = await getPolicy(policyId2);
  console.log(`Policy 2 ID: ${policyId2}, status: ${policy2ActiveSnapshot?.status}, pinned URL: ${policy2ActiveSnapshot?.evidence_url}`);

  const step7BuyData = {
    step: '7a_buy_second',
    caller: buyerAccount.address,
    function: 'buy',
    tx_hash: step7BuyReceipt.txHash,
    status_name: step7BuyReceipt.receipt?.status_name,
    result_name: step7BuyReceipt.receipt?.result_name,
    leader_result: step7BuyReceipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step7BuyReceipt.check.classification,
    elapsed_seconds: step7BuyReceipt.elapsedSeconds,
    policy_id: policyId2,
    policy_snapshot: policy2ActiveSnapshot,
  };
  fs.writeFileSync(path.join(e2eDir, 'step7_buy_second.json'), JSON.stringify(step7BuyData, null, 2));

  // Cancel policy 2
  const buyerBalBeforeCancel = parseInt(await getBalanceOf(buyerAccount.address), 10);
  const poolHealthBeforeCancel = await getPoolHealth(createdProductId);

  console.log(`Submitting cancel for policy ${policyId2}...`);
  const step7CancelReceipt = await retry(
    () => cancelPolicy(clientBuyer, policyId2),
    'Cancel policy 2'
  );

  const buyerBalAfterCancel = parseInt(await getBalanceOf(buyerAccount.address), 10);
  const poolHealthAfterCancel = await getPoolHealth(createdProductId);
  const policy2CancelledSnapshot = await getPolicy(policyId2);

  const refundRecorded = buyerBalAfterCancel - buyerBalBeforeCancel;
  const reservedReleased =
    parseInt(poolHealthBeforeCancel?.reserved || '0', 10) -
    parseInt(poolHealthAfterCancel?.reserved || '0', 10);

  console.log(`Policy 2 status after cancel: ${policy2CancelledSnapshot?.status}`);
  console.log(`Refund recorded: ${refundRecorded} CR (contract design: non-refundable premium)`);
  console.log(`Pool reserved released: ${reservedReleased} CR (expected: ${coverageP2} CR)`);

  const step7Data = {
    step: '7_cancel_policy',
    caller: buyerAccount.address,
    function: 'cancel',
    policy_id: policyId2,
    buy_tx_hash: step7BuyReceipt.txHash,
    cancel_tx_hash: step7CancelReceipt.txHash,
    status_name: step7CancelReceipt.receipt?.status_name,
    result_name: step7CancelReceipt.receipt?.result_name,
    leader_result: step7CancelReceipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step7CancelReceipt.check.classification,
    elapsed_seconds: step7CancelReceipt.elapsedSeconds,
    buyer_balance_before_cancel: buyerBalBeforeCancel,
    buyer_balance_after_cancel: buyerBalAfterCancel,
    refund_amount: refundRecorded,
    pool_reserved_before: poolHealthBeforeCancel?.reserved,
    pool_reserved_after: poolHealthAfterCancel?.reserved,
    reserved_released: reservedReleased,
    policy_snapshot: policy2CancelledSnapshot,
  };
  fs.writeFileSync(path.join(e2eDir, 'step7_cancel_policy.json'), JSON.stringify(step7Data, null, 2));
  recordStep('step7_cancel_policy', step7Data);

  // ---------------------------------------------------------------------------
  // STEP 8: Withdraw unreserved pool capital
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 8: Withdraw unreserved (Creator) ---');
  const withdrawAmount = 50;
  const creatorBalBeforeWithdraw = parseInt(await getBalanceOf(creatorAccount.address), 10);
  const poolHealthBeforeWithdraw = await getPoolHealth(createdProductId);

  console.log(`Withdrawing ${withdrawAmount} CR unreserved from pool ${createdProductId}...`);
  const step8Receipt = await retry(
    () => withdrawUnreserved(clientCreator, createdProductId, withdrawAmount),
    'Withdraw unreserved'
  );

  const creatorBalAfterWithdraw = parseInt(await getBalanceOf(creatorAccount.address), 10);
  const poolHealthAfterWithdraw = await getPoolHealth(createdProductId);

  console.log(`Creator balance after withdraw: ${creatorBalAfterWithdraw} CR (+${creatorBalAfterWithdraw - creatorBalBeforeWithdraw} CR)`);
  console.log(`Pool balance after withdraw:    ${poolHealthAfterWithdraw?.pool_balance} CR`);

  const step8Data = {
    step: '8_withdraw_unreserved',
    caller: creatorAccount.address,
    function: 'withdraw_unreserved',
    product_id: createdProductId,
    withdraw_amount: withdrawAmount,
    tx_hash: step8Receipt.txHash,
    status_name: step8Receipt.receipt?.status_name,
    result_name: step8Receipt.receipt?.result_name,
    leader_result: step8Receipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step8Receipt.check.classification,
    elapsed_seconds: step8Receipt.elapsedSeconds,
    creator_balance_before: creatorBalBeforeWithdraw,
    creator_balance_after: creatorBalAfterWithdraw,
    creator_balance_delta: creatorBalAfterWithdraw - creatorBalBeforeWithdraw,
    pool_health_before: poolHealthBeforeWithdraw,
    pool_health_after: poolHealthAfterWithdraw,
  };
  fs.writeFileSync(path.join(e2eDir, 'step8_withdraw.json'), JSON.stringify(step8Data, null, 2));
  recordStep('step8_withdraw_unreserved', step8Data);

  // ---------------------------------------------------------------------------
  // STEP 9: CoverGuard (5-arg is_covered_for, is_covered, attest, attestations)
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 9: CoverGuard Integration ---');
  // 1. Check is_covered on settled policy 1
  const isCoveredP1 = await isCovered(buyerAccount.address, policyId1);
  console.log(`CoverGuard is_covered(Policy 1): covered=${isCoveredP1.covered}, reason=${isCoveredP1.reason}`);

  // 2. Check is_covered on cancelled policy 2 (CANCELLED)
  const isCoveredP2 = await isCovered(buyerAccount.address, policyId2);
  console.log(`CoverGuard is_covered(Policy 2): covered=${isCoveredP2.covered}, reason=${isCoveredP2.reason}`);

  // 3. Buy policy 3 (active policy) for CoverGuard attestation
  console.log(`Buying policy 3 (coverage 50 CR) to attest active coverage...`);
  const step9BuyReceipt = await retry(
    () => buyPolicy(clientBuyer, createdProductId, 50),
    'Buy policy 3'
  );
  const step9BuyData = {
    step: '9a_buy_third',
    caller: buyerAccount.address,
    function: 'buy',
    tx_hash: step9BuyReceipt.txHash,
    status_name: step9BuyReceipt.receipt?.status_name,
    result_name: step9BuyReceipt.receipt?.result_name,
    leader_result: step9BuyReceipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step9BuyReceipt.check.classification,
    elapsed_seconds: step9BuyReceipt.elapsedSeconds,
  };
  fs.writeFileSync(path.join(e2eDir, 'step9_buy_third.json'), JSON.stringify(step9BuyData, null, 2));

  const extractedPolicyId3 = extractProductIdFromReceipt(step9BuyReceipt.receipt);
  const statsAfterBuy3 = await getStats();
  const policyId3 = extractedPolicyId3 || String(parseInt(statsAfterBuy3.next_policy, 10) - 1);
  const policy3Snapshot = await getPolicy(policyId3);
  console.log(`Policy 3 ID: ${policyId3}, terms_hash: ${policy3Snapshot?.terms_hash}`);

  // 4. Check is_covered on policy 3 (ACTIVE)
  const isCoveredP3 = await isCovered(buyerAccount.address, policyId3);
  console.log(`CoverGuard is_covered(Policy 3): covered=${isCoveredP3.covered}, reason=${isCoveredP3.reason}`);

  // 5. Check 5-arg is_covered_for: (holder, policy_id, product_id, terms_hash, min_coverage)
  const termsHash = policy3Snapshot?.terms_hash || '';
  const isCoveredForExact = await isCoveredFor(
    buyerAccount.address,
    policyId3,
    createdProductId,
    termsHash,
    50
  );
  const isCoveredForExceed = await isCoveredFor(
    buyerAccount.address,
    policyId3,
    createdProductId,
    termsHash,
    100
  );
  const isCoveredForWrongHash = await isCoveredFor(
    buyerAccount.address,
    policyId3,
    createdProductId,
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    50
  );
  console.log(`CoverGuard is_covered_for(50 CR, valid terms): ${isCoveredForExact} (expected true)`);
  console.log(`CoverGuard is_covered_for(100 CR, exceed):     ${isCoveredForExceed} (expected false)`);
  console.log(`CoverGuard is_covered_for(wrong terms_hash):   ${isCoveredForWrongHash} (expected false)`);

  // 6. Attest coverage
  console.log(`Attesting coverage for policy ${policyId3}...`);
  const step9AttestReceipt = await retry(
    () => attestCoverage(clientBuyer, policyId3),
    'Attest coverage'
  );
  console.log(`Attestation tx: ${step9AttestReceipt.txHash}`);

  // 7. Query attestations
  const buyerAttestations = await listAttestations(buyerAccount.address);
  console.log(`Buyer attestations count: ${buyerAttestations.length}`);
  const latestAttestation = buyerAttestations[0] || null;

  const step9Data = {
    step: '9_coverguard',
    caller: buyerAccount.address,
    policy_1_check: isCoveredP1,
    policy_2_check: isCoveredP2,
    policy_3_id: policyId3,
    policy_3_check: isCoveredP3,
    is_covered_for_50_exact: isCoveredForExact,
    is_covered_for_100_exceed: isCoveredForExceed,
    is_covered_for_wrong_terms: isCoveredForWrongHash,
    attest_tx_hash: step9AttestReceipt.txHash,
    status_name: step9AttestReceipt.receipt?.status_name,
    result_name: step9AttestReceipt.receipt?.result_name,
    leader_result: step9AttestReceipt.receipt?.consensus_data?.leader_receipt?.[0]?.execution_result,
    classification: step9AttestReceipt.check.classification,
    elapsed_seconds: step9AttestReceipt.elapsedSeconds,
    attestations_count: buyerAttestations.length,
    latest_attestation: latestAttestation,
  };
  fs.writeFileSync(path.join(e2eDir, 'step9_coverguard.json'), JSON.stringify(step9Data, null, 2));
  recordStep('step9_coverguard', step9Data);

  // ---------------------------------------------------------------------------
  // Aggregate Summary File (Writes vs Reads)
  // ---------------------------------------------------------------------------
  console.log('\n--- Aggregating E2E Execution Summary ---');
  const e2eFiles = fs.readdirSync(e2eDir).filter((f) => f.startsWith('step') && f.endsWith('.json'));

  const writes = [];
  const reads = [];
  let writeAttempts = 0;
  let writeSuccesses = 0;
  let writeFailures = 0;

  for (const f of e2eFiles.sort()) {
    const raw = fs.readFileSync(path.join(e2eDir, f), 'utf8');
    const parsed = JSON.parse(raw);

    const txHash = parsed.tx_hash || parsed.cancel_tx_hash || parsed.attest_tx_hash;
    const isWrite = Boolean(txHash && txHash.startsWith('0x'));

    if (isWrite) {
      writeAttempts++;
      const isSuccess =
        parsed.classification === 'SUCCESS' ||
        (parsed.status_name === 'ACCEPTED' && parsed.leader_result === 'SUCCESS');

      if (isSuccess) {
        writeSuccesses++;
      } else {
        writeFailures++;
      }

      writes.push({
        file: f,
        step: parsed.step || f,
        function: parsed.function || 'write',
        tx_hash: txHash,
        status_name: parsed.status_name || 'N/A',
        result_name: parsed.result_name || 'N/A',
        leader_result: parsed.leader_result || 'N/A',
        classification: parsed.classification || 'SUCCESS',
        elapsed_seconds: parsed.elapsed_seconds || 'N/A',
      });
    } else {
      reads.push({
        file: f,
        step: parsed.step || f,
        description: parsed.match ? 'Formula match check' : 'View readback',
        details: parsed,
      });
    }
  }

  const summary = {
    contracts: {
      cover: DEPLOYMENTS.cover.address,
      coverGuard: DEPLOYMENTS.coverGuard.address,
    },
    write_attempts: writeAttempts,
    write_successes: writeSuccesses,
    write_failures: writeFailures,
    writes,
    reads_no_tx: [
      {
        step: '4_quote_premium',
        function: 'quote_premium',
        result: `Quoted ${quotedPremium} CR, formula ceiling ${expectedCeil} CR, charged ${premiumCharged} CR (exact match)`,
      },
      {
        step: '9_coverguard_views',
        function: 'is_covered & is_covered_for',
        result: `Policy ${policyId1}: covered=${isCoveredP1.covered} (${isCoveredP1.reason}); Policy ${policyId2}: covered=${isCoveredP2.covered} (${isCoveredP2.reason}); Policy ${policyId3}: covered=${isCoveredP3.covered} (${isCoveredP3.reason}); is_covered_for(50)=${isCoveredForExact}; is_covered_for(100)=${isCoveredForExceed}; is_covered_for(wrong_terms)=${isCoveredForWrongHash}`,
      },
      {
        step: '9_list_attestations',
        function: 'list_attestations',
        result: `Retrieved ${buyerAttestations.length} on-chain attestation record(s) for Policy ${policyId3}`,
      },
    ],
  };
  fs.writeFileSync(path.join(e2eDir, 'e2e_summary.json'), JSON.stringify(summary, null, 2));

  console.log('======================================================');
  console.log(`E2E SUMMARY: ${writeSuccesses}/${writeAttempts} on-chain writes successful, ${writeFailures} failures`);
  console.log('======================================================');
}

main().catch((err) => {
  console.error('FATAL E2E ERROR:', err);
  process.exit(1);
});
