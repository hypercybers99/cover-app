export interface ProductRecord {
  id: string;
  name: string;
  url: string;
  rule_text: string;
  min_full: string;
  min_half: string;
  premium_bps: string;
  creator: string;
  pool_balance: string;
  terms_hash: string;
  schema_version?: string;
}

export type PolicyStatus = 'ACTIVE' | 'PAID' | 'CANCELLED';

export interface PolicyRecord {
  id: string;
  product_id: string;
  holder: string;
  coverage: string;
  premium: string;
  created_at?: string;
  status: PolicyStatus;
  settlement_id: string;
  cancel_refund: string;
  terms_hash?: string;
  schema_version?: string;
}

export interface PoolHealthRecord {
  product_id: string;
  pool_balance: string;
  reserved: string;
  free: string;
  coverage_ratio_bps: string;
  schema_version?: string;
}

export interface SettlementRecord {
  id: string;
  policy_id: string;
  product_id: string;
  gate: 'PAGE_UNCHANGED' | 'TRIPWIRE' | 'JUDGED' | 'PARSE_FAILURE' | string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'UNCLEAR' | string;
  minutes: string;
  quote: string;
  outcome: 'PAY_100' | 'PAY_50' | 'PAY_25' | 'NO_PAY' | 'REVIEW' | string;
  payout: string;
  tripwire: boolean;
  observed_at?: string;
  schema_version?: string;
}

export interface PlatformStats {
  total_minted: string;
  next_product: string;
  next_policy: string;
  next_settlement: string;
  schema_version?: string;
}

export interface PlatformLimits {
  max_name_chars: string;
  max_rule_chars: string;
  max_url_chars: string;
  max_page_bytes: string;
  min_text_chars: string;
  max_quote_chars: string;
  min_bps: string;
  max_bps: string;
  min_full_threshold: string;
  max_full_threshold: string;
  schema_version?: string;
}

export interface CoverCheckRecord {
  covered: 'true' | 'false' | string;
  reason: 'OK' | 'NO_POLICY' | 'NOT_HOLDER' | 'PAID' | 'CANCELLED' | 'POOL_SHORT' | string;
  policy_status: string;
  coverage: string;
  product_id: string;
}

export interface AttestationRecord {
  id: string;
  attester: string;
  policy_id: string;
  product_id: string;
  coverage: string;
  terms_hash: string;
  schema_version?: string;
}

// UI and Application Domain Types
export type Outcome = 'PAY_100' | 'PAY_50' | 'PAY_25' | 'NO_PAY' | 'REVIEW';
export type Gate = 'PAGE_UNCHANGED' | 'TRIPWIRE' | 'JUDGED';

export interface TxState {
  stage: 'idle' | 'submitting' | 'pending_consensus' | 'finalized' | 'user_error' | 'failed';
  txHash?: string;
  errorMessage?: string;
}

export interface Product {
  id: number;
  name: string;
  source_url: string;
  rule_text: string;
  payout_100_threshold: number;
  payout_50_threshold: number;
  payout_25_threshold: number;
  premium_bps: number;
  creator: string;
  pool_balance: number;
  reserved: number;
  active_policies: number;
}

export interface Policy {
  id: number;
  product_id: number;
  buyer: string;
  coverage_amount: number;
  premium: number;
  start_time: number;
  end_time: number;
  status: 'ACTIVE' | 'SETTLED' | 'CANCELLED';
  outcome: Outcome;
  gate: Gate;
  settlement_tx_hash?: string;
  initial_snapshot_hash?: string;
  settlement_snapshot_hash?: string;
}

export interface Limits {
  min_deposit: number;
  max_deposit: number;
  min_coverage: number;
  max_coverage: number;
  min_duration_days: number;
  max_duration_days: number;
  min_premium_bps: number;
  max_premium_bps: number;
  name_min_len: number;
  name_max_len: number;
  url_max_len: number;
  rule_min_len: number;
  rule_max_len: number;
}

