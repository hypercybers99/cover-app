import { createClient, chains } from 'genlayer-js';
import { DEPLOYMENTS, NETWORK } from '../config/deployments';
import type {
  ProductRecord,
  PolicyRecord,
  PoolHealthRecord,
  SettlementRecord,
  PlatformStats,
  PlatformLimits,
  CoverCheckRecord,
  AttestationRecord,
} from '../types/contract';

export const publicClient = createClient({
  chain: chains.studionet,
  endpoint: NETWORK.rpcUrl,
});

const COVER_ADDRESS = DEPLOYMENTS.cover.address;
const GUARD_ADDRESS = DEPLOYMENTS.coverGuard.address;

function parseJson<T>(raw: unknown): T {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return raw as T;
    }
  }
  return raw as T;
}

// ============================================================================
// Cover Public Views
// ============================================================================

export async function getBalanceOf(address: string): Promise<string> {
  try {
    const res = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'balance_of',
      args: [address.trim()],
    });
    return String(res || '0');
  } catch (err) {
    console.warn(`Error reading balance for ${address}:`, err);
    return '0';
  }
}

export async function getProduct(productId: string): Promise<ProductRecord | null> {
  try {
    const raw = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'get_product',
      args: [String(productId).trim()],
    });
    return parseJson<ProductRecord>(raw);
  } catch (err) {
    console.warn(`Error reading product ${productId}:`, err);
    return null;
  }
}

export async function listProducts(limit: number = 20): Promise<ProductRecord[]> {
  try {
    const rawList = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'list_products',
      args: [Math.min(limit, 20)],
    });
    if (!Array.isArray(rawList)) return [];
    return rawList.map(item => parseJson<ProductRecord>(item));
  } catch (err) {
    console.warn('Error listing products:', err);
    return [];
  }
}

export async function getPolicy(policyId: string): Promise<PolicyRecord | null> {
  try {
    const raw = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'get_policy',
      args: [String(policyId).trim()],
    });
    return parseJson<PolicyRecord>(raw);
  } catch (err) {
    console.warn(`Error reading policy ${policyId}:`, err);
    return null;
  }
}

export async function listPoliciesByHolder(holderAddress: string, limit: number = 20): Promise<PolicyRecord[]> {
  try {
    const rawList = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'list_policies_by_holder',
      args: [holderAddress.trim(), Math.min(limit, 20)],
    });
    if (!Array.isArray(rawList)) return [];
    return rawList.map(item => parseJson<PolicyRecord>(item));
  } catch (err) {
    console.warn(`Error listing policies for holder ${holderAddress}:`, err);
    return [];
  }
}

export async function listPoliciesByProduct(productId: string, limit: number = 20): Promise<PolicyRecord[]> {
  try {
    const rawList = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'list_policies_by_product',
      args: [String(productId).trim(), Math.min(limit, 20)],
    });
    if (!Array.isArray(rawList)) return [];
    return rawList.map(item => parseJson<PolicyRecord>(item));
  } catch (err) {
    console.warn(`Error listing policies for product ${productId}:`, err);
    return [];
  }
}

export async function getPoolHealth(productId: string): Promise<PoolHealthRecord | null> {
  try {
    const raw = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'pool_health',
      args: [String(productId).trim()],
    });
    return parseJson<PoolHealthRecord>(raw);
  } catch (err) {
    console.warn(`Error reading pool health for product ${productId}:`, err);
    return null;
  }
}

export async function getSettlement(settlementId: string): Promise<SettlementRecord | null> {
  try {
    const raw = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'get_settlement',
      args: [String(settlementId).trim()],
    });
    return parseJson<SettlementRecord>(raw);
  } catch (err) {
    console.warn(`Error reading settlement ${settlementId}:`, err);
    return null;
  }
}

export async function quotePremium(coverage: number, premiumBps: number): Promise<number> {
  try {
    const raw = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'quote_premium',
      args: [coverage, premiumBps],
    });
    return parseInt(String(raw), 10);
  } catch {
    // Pure calculation fallback matching contract ceiling formula
    const prod = coverage * premiumBps;
    return Math.max(1, Math.floor((prod + 9999) / 10000));
  }
}

export async function getStats(): Promise<PlatformStats> {
  try {
    const raw = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'get_stats',
      args: [],
    });
    return parseJson<PlatformStats>(raw);
  } catch (err) {
    console.warn('Error reading stats:', err);
    return {
      total_minted: '0',
      next_product: '1',
      next_policy: '1',
      next_settlement: '1',
    };
  }
}

export async function getLimits(): Promise<PlatformLimits> {
  try {
    const raw = await publicClient.readContract({
      address: COVER_ADDRESS,
      functionName: 'get_limits',
      args: [],
    });
    return parseJson<PlatformLimits>(raw);
  } catch (err) {
    console.warn('Error reading limits:', err);
    return {
      max_name_chars: '60',
      max_rule_chars: '200',
      max_url_chars: '300',
      max_page_bytes: '400000',
      min_text_chars: '200',
      max_quote_chars: '300',
      min_bps: '100',
      max_bps: '5000',
      min_full_threshold: '2',
      max_full_threshold: '10080',
    };
  }
}

// ============================================================================
// CoverGuard Public Views
// ============================================================================

export async function isCovered(holderAddress: string, policyId: string): Promise<CoverCheckRecord> {
  try {
    const raw = await publicClient.readContract({
      address: GUARD_ADDRESS,
      functionName: 'is_covered',
      args: [holderAddress.trim(), String(policyId).trim()],
    });
    return parseJson<CoverCheckRecord>(raw);
  } catch (err) {
    console.warn(`Error reading is_covered for ${holderAddress}, policy ${policyId}:`, err);
    return {
      covered: 'false',
      reason: 'ERROR',
      policy_status: '',
      coverage: '0',
      product_id: '',
    };
  }
}

export async function isCoveredFor(
  holderAddress: string,
  policyId: string,
  productId: string,
  termsHash: string,
  minCoverage: number
): Promise<boolean> {
  try {
    const res = await publicClient.readContract({
      address: GUARD_ADDRESS,
      functionName: 'is_covered_for',
      args: [
        holderAddress.trim(),
        String(policyId).trim(),
        String(productId).trim(),
        termsHash.trim(),
        minCoverage,
      ],
    });
    return Boolean(res);
  } catch (err) {
    console.warn('Error checking is_covered_for:', err);
    return false;
  }
}

export async function getAttestation(attestationId: string): Promise<AttestationRecord | null> {
  try {
    const raw = await publicClient.readContract({
      address: GUARD_ADDRESS,
      functionName: 'get_attestation',
      args: [String(attestationId).trim()],
    });
    return parseJson<AttestationRecord>(raw);
  } catch (err) {
    console.warn(`Error reading attestation ${attestationId}:`, err);
    return null;
  }
}

export async function listAttestations(attesterAddress: string, limit: number = 10): Promise<AttestationRecord[]> {
  try {
    const rawList = await publicClient.readContract({
      address: GUARD_ADDRESS,
      functionName: 'list_attestations',
      args: [attesterAddress.trim(), Math.min(limit, 20)],
    });
    if (!Array.isArray(rawList)) return [];
    return rawList.map(item => parseJson<AttestationRecord>(item));
  } catch (err) {
    console.warn(`Error listing attestations for ${attesterAddress}:`, err);
    return [];
  }
}
