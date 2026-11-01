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
  Product,
  Policy,
  Limits,
  Outcome,
  Gate,
} from '../types/contract';

export const publicClient = createClient({
  chain: chains.studionet,
  endpoint: NETWORK.rpcUrl,
});

const COVER_ADDRESS = DEPLOYMENTS.cover.address as `0x${string}`;
const GUARD_ADDRESS = DEPLOYMENTS.coverGuard.address as `0x${string}`;


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

// ============================================================================
// Object-Oriented Client Classes for UI Pages
// ============================================================================

export class CoverReadClient {
  async getProductCount(): Promise<number> {
    const stats = await getStats();
    return Math.max(0, parseInt(stats.next_product || '1', 10) - 1);
  }

  async getAllProducts(limit: number = 20): Promise<Product[]> {
    const list = await listProducts(limit);
    return list.map(this.mapProduct);
  }

  async getProduct(productId: number | string): Promise<Product | null> {
    const rec = await getProduct(String(productId));
    if (!rec) return null;
    return this.mapProduct(rec);
  }

  async getPolicy(policyId: number | string): Promise<Policy | null> {
    const rec = await getPolicy(String(policyId));
    if (!rec) return null;
    let outcome: Outcome = 'REVIEW';
    let gate: Gate = 'JUDGED';
    let settlement_snapshot_hash: string | undefined;
    let settlement_tx_hash: string | undefined;

    if (rec.settlement_id && rec.settlement_id !== '0') {
      const sett = await getSettlement(rec.settlement_id);
      if (sett) {
        outcome = (sett.outcome as Outcome) || 'REVIEW';
        gate = (sett.gate as Gate) || 'JUDGED';
        settlement_snapshot_hash = sett.quote;
      }
    }

    return {
      id: parseInt(rec.id, 10),
      product_id: parseInt(rec.product_id, 10),
      buyer: rec.holder,
      coverage_amount: parseInt(rec.coverage || '0', 10),
      premium: parseInt(rec.premium || '0', 10),
      start_time: rec.created_at ? parseInt(rec.created_at, 10) : 0,
      end_time: rec.created_at ? parseInt(rec.created_at, 10) + 30 * 86400 : 0,
      status: rec.status === 'PAID' ? 'SETTLED' : (rec.status as any),
      outcome,
      gate,
      settlement_tx_hash,
      initial_snapshot_hash: rec.terms_hash,
      settlement_snapshot_hash,
    };
  }

  async getProductPolicies(productId: number | string, limit: number = 20): Promise<Policy[]> {
    const recs = await listPoliciesByProduct(String(productId), limit);
    return recs.map((rec) => ({
      id: parseInt(rec.id, 10),
      product_id: parseInt(rec.product_id, 10),
      buyer: rec.holder,
      coverage_amount: parseInt(rec.coverage || '0', 10),
      premium: parseInt(rec.premium || '0', 10),
      start_time: rec.created_at ? parseInt(rec.created_at, 10) : 0,
      end_time: rec.created_at ? parseInt(rec.created_at, 10) + 30 * 86400 : 0,
      status: rec.status === 'PAID' ? 'SETTLED' : (rec.status as any),
      outcome: 'REVIEW',
      gate: 'JUDGED',
    }));
  }

  async quotePremium(productId: number | string, coverage: number, _days?: number): Promise<number> {
    const prod = await this.getProduct(productId);
    const bps = prod ? prod.premium_bps : 500;
    return quotePremium(coverage, bps);
  }

  async getLimits(): Promise<Limits> {
    const lim = await getLimits();
    return {
      min_deposit: 1,
      max_deposit: 1000000,
      min_coverage: 1,
      max_coverage: 100000,
      min_duration_days: 1,
      max_duration_days: 365,
      min_premium_bps: parseInt(lim.min_bps || '100', 10),
      max_premium_bps: parseInt(lim.max_bps || '5000', 10),
      name_min_len: 3,
      name_max_len: parseInt(lim.max_name_chars || '60', 10),
      url_max_len: parseInt(lim.max_url_chars || '300', 10),
      rule_min_len: 10,
      rule_max_len: parseInt(lim.max_rule_chars || '200', 10),
    };
  }

  private mapProduct(rec: ProductRecord): Product {
    return {
      id: parseInt(rec.id, 10),
      name: rec.name,
      source_url: rec.url,
      rule_text: rec.rule_text,
      payout_100_threshold: parseInt(rec.min_full || '90', 10),
      payout_50_threshold: parseInt(rec.min_half || '50', 10),
      payout_25_threshold: 25,
      premium_bps: parseInt(rec.premium_bps || '500', 10),
      creator: rec.creator,
      pool_balance: parseInt(rec.pool_balance || '0', 10),
      reserved: 0,
      active_policies: 0,
    };
  }
}

export class CoverGuardReadClient {
  async getCoverContract(): Promise<string> {
    return COVER_ADDRESS;
  }

  async isCovered(holderAddress: string, policyId?: string): Promise<boolean> {
    const res = await isCovered(holderAddress, policyId || '1');
    return res.covered === 'true' || res.covered === '1';
  }

  async isCoveredFor(holderAddress: string, minCoverage: number): Promise<boolean> {
    return isCoveredFor(holderAddress, '1', '1', '', minCoverage);
  }

  async getAttestation(attestationIdOrAddress: string): Promise<number | null> {
    const rec = await getAttestation(attestationIdOrAddress);
    return rec ? Date.now() / 1000 : null;
  }
}

