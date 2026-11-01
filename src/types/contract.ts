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
