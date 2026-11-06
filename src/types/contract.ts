// Contract Data Types strictly matching GenLayer CoverV2 & CoverGuardV2 records key-for-key.
// No phantom or clock fields (no start_time, end_time, days, min_duration_days).

export type PolicyStatus = 'ACTIVE' | 'SETTLED' | 'CANCELLED';

export interface ProductRecord {
  schema_version: string;
  id: string;
  creator: string;
  name: string;
  url: string;
  host: string;
  dir_path: string;
  decision_rule: string;
  term: string;
  min_full: string;
  min_half: string;
  premium_bps: string;
  terms_hash: string;
  pool_balance: string;
  reserved: string;
  policy_count: string;
  source_history: string[];
  seq: string;
}

export interface PolicyRecord {
  schema_version: string;
  id: string;
  product_id: string;
  holder: string;
  coverage: string;
  premium: string;
  status: PolicyStatus;
  buy_norm_hash16: string;
  paid_amount: string;
  payout: string;
  settlement_id: string;
  cancel_refund: string;
  terms_hash: string;
  evidence_url: string;
  decision_rule: string;
  min_full: string;
  min_half: string;
  premium_bps: string;
  term: string;
  attempts: string;
  seq: string;
}

export interface PoolHealthRecord {
  schema_version: string;
  product_id: string;
  pool_balance: string;
  reserved: string;
  free: string;
  coverage_ratio_bps: string;
}

export interface SettlementRecord {
  schema_version: string;
  id: string;
  policy_id: string;
  product_id: string;
  caller: string;
  terms_hash: string;
  evidence_url: string;
  url_used: string;
  coverage: string;
  payout: string;
  status: string;
  minutes: string;
  quote: string;
  outcome: string;
  gate: string;
  tripwire: string; // 'true' | 'false' string in contract
}

export interface PlatformLimits {
  schema_version: string;
  demo_credits: string;
  max_coverage: string;
  min_coverage: string;
  max_page_bytes: string;
  min_text_chars: string;
  max_list_limit: string;
}

export interface PlatformStats {
  schema_version: string;
  total_minted: string;
  next_product: string;
  next_policy: string;
  next_settlement: string;
}

export interface AttestationRecord {
  schema_version: string;
  id: string;
  attester: string;
  policy_id: string;
  product_id: string;
  coverage: string;
  terms_hash: string;
  evidence_url_hash: string;
}

export interface CoverCheckRecord {
  covered: 'true' | 'false' | string;
  reason: string;
  policy_id?: string;
  coverage?: string;
}

// UI Domain Types (clean numbers / parsed representations)
export type Outcome = 'PAY_100' | 'PAY_50' | 'PAY_25' | 'NO_PAY' | 'REVIEW';
export type Gate = 'PAGE_UNCHANGED' | 'TRIPWIRE' | 'JUDGED';

export interface TxState {
  stage: 'idle' | 'submitting' | 'pending_consensus' | 'finalized' | 'user_error' | 'failed';
  txHash?: string;
  errorMessage?: string;
}

export interface Product {
  id: string;
  name: string;
  url: string;
  creator: string;
  decision_rule: string;
  term: string;
  min_full: number;
  min_half: number;
  premium_bps: number;
  terms_hash: string;
  pool_balance: number;
  reserved: number;
  policy_count: number;
  source_history: string[];
  seq: string;
}

export interface Policy {
  id: string;
  product_id: string;
  holder: string;
  coverage: number;
  premium: number;
  status: PolicyStatus;
  terms_hash: string;
  evidence_url: string;
  decision_rule: string;
  term: string;
  min_full_outage_minutes: number;
  min_half_outage_minutes: number;
  premium_bps: number;
  payout: number;
  settlement_id: string;
  buy_norm_hash16: string;
  created_at_step?: string;
  settled_at_step?: string;
  cancel_refund?: number;
}

export interface Limits {
  demo_credits: number;
  max_coverage: number;
  min_coverage: number;
  max_page_bytes: number;
  min_text_chars: number;
  max_list_limit: number;
}
