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
      schema_version: '1',
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
      schema_version: '1',
      demo_credits: '1000',
      max_coverage: '100000',
      min_coverage: '10',
      max_page_bytes: '400000',
      min_text_chars: '200',
      max_list_limit: '20',
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
      coverage: '0',
      policy_id: policyId,
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

    return {
      id: rec.id,
      product_id: rec.product_id,
      holder: rec.holder,
      coverage: parseInt(rec.coverage || '0', 10),
      premium: parseInt(rec.premium || '0', 10),
      status: rec.status,
      terms_hash: rec.terms_hash,
      evidence_url: rec.evidence_url,
      decision_rule: rec.decision_rule,
      term: rec.term || 'OPEN_UNTIL_SETTLED_OR_CANCELLED',
      min_full_outage_minutes: parseInt(rec.min_full || '30', 10),
      min_half_outage_minutes: parseInt(rec.min_half || '15', 10),
      premium_bps: parseInt(rec.premium_bps || '500', 10),
      payout: parseInt(rec.payout || '0', 10),
      settlement_id: rec.settlement_id || '',
      buy_norm_hash16: rec.buy_norm_hash16,
      cancel_refund: parseInt(rec.cancel_refund || '0', 10),
    };
  }

  async getProductPolicies(productId: number | string, limit: number = 20): Promise<Policy[]> {
    const recs = await listPoliciesByProduct(String(productId), limit);
    return recs.map((rec) => ({
      id: rec.id,
      product_id: rec.product_id,
      holder: rec.holder,
      coverage: parseInt(rec.coverage || '0', 10),
      premium: parseInt(rec.premium || '0', 10),
      status: rec.status,
      terms_hash: rec.terms_hash,
      evidence_url: rec.evidence_url,
      decision_rule: rec.decision_rule,
      term: rec.term || 'OPEN_UNTIL_SETTLED_OR_CANCELLED',
      min_full_outage_minutes: parseInt(rec.min_full || '30', 10),
      min_half_outage_minutes: parseInt(rec.min_half || '15', 10),
      premium_bps: parseInt(rec.premium_bps || '500', 10),
      payout: parseInt(rec.payout || '0', 10),
      settlement_id: rec.settlement_id || '',
      buy_norm_hash16: rec.buy_norm_hash16,
      cancel_refund: parseInt(rec.cancel_refund || '0', 10),
    }));
  }

  async quotePremium(productId: number | string, coverage: number): Promise<number> {
    const prod = await this.getProduct(productId);
    const bps = prod ? prod.premium_bps : 500;
    return quotePremium(coverage, bps);
  }

  async getLimits(): Promise<Limits> {
    const lim = await getLimits();
    return {
      demo_credits: parseInt(lim.demo_credits || '1000', 10),
      max_coverage: parseInt(lim.max_coverage || '100000', 10),
      min_coverage: parseInt(lim.min_coverage || '10', 10),
      max_page_bytes: parseInt(lim.max_page_bytes || '400000', 10),
      min_text_chars: parseInt(lim.min_text_chars || '200', 10),
      max_list_limit: parseInt(lim.max_list_limit || '20', 10),
    };
  }

  private mapProduct(rec: ProductRecord): Product {
    return {
      id: rec.id,
      name: rec.name,
      url: rec.url,
      creator: rec.creator,
      decision_rule: rec.decision_rule,
      term: rec.term || 'OPEN_UNTIL_SETTLED_OR_CANCELLED',
      min_full: parseInt(rec.min_full || '30', 10),
      min_half: parseInt(rec.min_half || '15', 10),
      premium_bps: parseInt(rec.premium_bps || '500', 10),
      terms_hash: rec.terms_hash,
      pool_balance: parseInt(rec.pool_balance || '0', 10),
      reserved: parseInt(rec.reserved || '0', 10),
      policy_count: parseInt(rec.policy_count || '0', 10),
      source_history: rec.source_history || [rec.url],
      seq: rec.seq || '1',
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

  async isCoveredFor(
    holderAddress: string,
    policyId: string,
    productId: string,
    termsHash: string,
    minCoverage: number
  ): Promise<boolean> {
    return isCoveredFor(holderAddress, policyId, productId, termsHash, minCoverage);
  }

  async getAttestation(attestationId: string): Promise<AttestationRecord | null> {
    return getAttestation(attestationId);
  }
}

