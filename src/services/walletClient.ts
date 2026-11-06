import { createClient, chains } from 'genlayer-js';
import { DEPLOYMENTS, NETWORK } from '../config/deployments';
import { classifyReceipt, type ReceiptCheckResult } from '../lib/receipts';

const COVER_ADDRESS = DEPLOYMENTS.cover.address;
const GUARD_ADDRESS = DEPLOYMENTS.coverGuard.address;

export interface WriteProgressCallback {
  onSubmitted?: (txHash: string) => void;
  onTick?: (elapsedSeconds: number, status: string) => void;
}

export interface WriteExecutionResult {
  txHash: string;
  receipt: any;
  check: ReceiptCheckResult;
  elapsedSeconds: number;
}

// Ensure the browser wallet (MetaMask) is connected to Chain ID 61999
export async function ensureStudionetChain(provider: any): Promise<void> {
  if (!provider?.request) {
    throw new Error('No compatible browser wallet provider found. Please install MetaMask.');
  }

  const chainIdHex = '0x' + NETWORK.chainId.toString(16);
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError: any) {
    // Error code 4902 indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName: NETWORK.name,
            rpcUrls: [NETWORK.rpcUrl],
            nativeCurrency: {
              name: 'GEN',
              symbol: 'GEN',
              decimals: 18,
            },
            blockExplorerUrls: [NETWORK.explorerUrl],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export function getClientForAccount(account: any, provider?: any) {
  return createClient({
    chain: chains.studionet,
    endpoint: NETWORK.rpcUrl,
    account: account,
    ...(provider ? { provider } : {}),
  });
}

export async function executeWriteWithReceipt(
  client: any,
  address: string,
  functionName: string,
  args: any[],
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  const t0 = Date.now();

  const txHash = await client.writeContract({
    address,
    functionName,
    args,
    value: 0n,
  });

  if (callbacks?.onSubmitted) {
    callbacks.onSubmitted(txHash);
  }

  // Poll receipt with timer
  const startTime = Date.now();
  const timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (callbacks?.onTick) {
      callbacks.onTick(elapsed, 'Awaiting validator consensus...');
    }
  }, 1000);

  try {
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 120,
      interval: 3000,
    });
    clearInterval(timer);

    const elapsedSeconds = parseFloat(((Date.now() - t0) / 1000).toFixed(2));
    const check = classifyReceipt(receipt);

    return {
      txHash,
      receipt,
      check,
      elapsedSeconds,
    };
  } catch (err) {
    clearInterval(timer);
    throw err;
  }
}

// ============================================================================
// Cover Public Writes
// ============================================================================

export async function claimDemoCredits(
  client: any,
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  return executeWriteWithReceipt(client, COVER_ADDRESS, 'claim_demo_credits', [], callbacks);
}

export async function createProduct(
  client: any,
  name: string,
  url: string,
  minFull: number,
  minHalf: number,
  premiumBps: number,
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  return executeWriteWithReceipt(
    client,
    COVER_ADDRESS,
    'create_product',
    [name.trim(), url.trim(), minFull, minHalf, premiumBps],
    callbacks
  );
}

export async function fundProduct(
  client: any,
  productId: string,
  amount: number,
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  return executeWriteWithReceipt(
    client,
    COVER_ADDRESS,
    'fund_product',
    [String(productId).trim(), amount],
    callbacks
  );
}

export async function withdrawUnreserved(
  client: any,
  productId: string,
  amount: number,
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  return executeWriteWithReceipt(
    client,
    COVER_ADDRESS,
    'withdraw_unreserved',
    [String(productId).trim(), amount],
    callbacks
  );
}

export async function updateSource(
  client: any,
  productId: string,
  newUrl: string,
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  return executeWriteWithReceipt(
    client,
    COVER_ADDRESS,
    'update_source',
    [String(productId).trim(), newUrl.trim()],
    callbacks
  );
}

export async function buyPolicy(
  client: any,
  productId: string,
  coverage: number,
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  return executeWriteWithReceipt(
    client,
    COVER_ADDRESS,
    'buy',
    [String(productId).trim(), coverage],
    callbacks
  );
}

export async function settlePolicy(
  client: any,
  policyId: string,
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  return executeWriteWithReceipt(
    client,
    COVER_ADDRESS,
    'settle',
    [String(policyId).trim()],
    callbacks
  );
}

export async function cancelPolicy(
  client: any,
  policyId: string,
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  return executeWriteWithReceipt(
    client,
    COVER_ADDRESS,
    'cancel',
    [String(policyId).trim()],
    callbacks
  );
}

// ============================================================================
// CoverGuard Public Writes
// ============================================================================

export async function attestCoverage(
  client: any,
  policyId: string,
  callbacks?: WriteProgressCallback
): Promise<WriteExecutionResult> {
  return executeWriteWithReceipt(
    client,
    GUARD_ADDRESS,
    'attest',
    [String(policyId).trim()],
    callbacks
  );
}
