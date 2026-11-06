export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const DECISION_RULE_V2 =
  "OUTAGE >= min_full minutes: 100% | OUTAGE >= min_half: 50% | DEGRADED >= min_full: 25% | otherwise 0%; unreadable or unclear: REVIEW";

export const COVERAGE_TERM_V2 = "OPEN_UNTIL_SETTLED_OR_CANCELLED";

export const ALLOWED_PREFIX = "https://raw.githubusercontent.com/";
export const ALLOWED_GITHUB_PREFIX = ALLOWED_PREFIX;

export const GITHUB_FIXTURE_PRESETS = [
  {
    code: 's0',
    label: 's0: Operational Baseline',
    url: 'https://raw.githubusercontent.com/hypercybers99/cover-fixtures/92c69bc636517656b9e7ee031a503adfb2d26bb4/status-s0-operational.md',
    desc: 'Operational baseline page. Recommended for initial product creation so policies pass the inception gate.',
  },
  {
    code: 's1',
    label: 's1: Major Outage 75 min (100% Payout)',
    url: 'https://raw.githubusercontent.com/hypercybers99/cover-fixtures/92c69bc636517656b9e7ee031a503adfb2d26bb4/status-s1-outage-75.md',
    desc: 'Major outage lasting 75 minutes. Outage exceeds min_full threshold (100% payout upon settlement).',
  },
  {
    code: 's2',
    label: 's2: Partial Outage 35 min (50% Payout)',
    url: 'https://raw.githubusercontent.com/hypercybers99/cover-fixtures/92c69bc636517656b9e7ee031a503adfb2d26bb4/status-s2-outage-35.md',
    desc: 'Partial outage lasting 35 minutes. Exceeds min_half threshold (50% payout upon settlement).',
  },
  {
    code: 's3',
    label: 's3: Minor Outage 20 min (0% Payout)',
    url: 'https://raw.githubusercontent.com/hypercybers99/cover-fixtures/92c69bc636517656b9e7ee031a503adfb2d26bb4/status-s3-outage-20.md',
    desc: 'Minor outage lasting 20 minutes. Below min_half threshold (0% payout).',
  },
  {
    code: 's4',
    label: 's4: Degraded 90 min (25% Payout)',
    url: 'https://raw.githubusercontent.com/hypercybers99/cover-fixtures/92c69bc636517656b9e7ee031a503adfb2d26bb4/status-s4-degraded-90.md',
    desc: 'Performance degraded lasting 90 minutes. Exceeds min_full threshold for degradation (25% payout).',
  },
  {
    code: 's5',
    label: 's5: Reformatted HTML (Operational)',
    url: 'https://raw.githubusercontent.com/hypercybers99/cover-fixtures/92c69bc636517656b9e7ee031a503adfb2d26bb4/status-s5-operational-reformatted.html',
    desc: 'Reformatted HTML operational status page in identical directory.',
  },
];

export function generateDecisionRuleSentence(minFull: number, minHalf: number): string {
  return `OUTAGE >= ${minFull} minutes: 100% | OUTAGE >= ${minHalf}: 50% | DEGRADED >= ${minFull}: 25% | otherwise 0%; unreadable or unclear: REVIEW`;
}

export function isPureAscii(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) {
      return false;
    }
  }
  return true;
}

export function isIpLiteral(host: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(host)) return true;
  if (host.includes(':')) return true;
  if (host.startsWith('[') && host.endsWith(']')) return true;
  return false;
}

export function validateProductUrl(urlStr: string): ValidationResult {
  if (!urlStr || urlStr.length < 1 || urlStr.length > 300) {
    return { valid: false, error: 'bad URL: length must be between 1 and 300 characters' };
  }
  if (!isPureAscii(urlStr)) {
    return { valid: false, error: 'bad URL: must be pure ASCII' };
  }

  try {
    const parsed = new URL(urlStr);

    if (parsed.protocol.toLowerCase() !== 'https:') {
      return { valid: false, error: 'bad URL: scheme must be https' };
    }

    if (parsed.username || parsed.password) {
      return { valid: false, error: 'bad URL: userinfo not allowed' };
    }

    if (parsed.hash) {
      return { valid: false, error: 'bad URL: fragment not allowed' };
    }

    const host = parsed.hostname;
    if (!host) {
      return { valid: false, error: 'bad URL: missing host' };
    }

    if (isIpLiteral(host)) {
      return { valid: false, error: 'bad URL: IP literals not allowed' };
    }

    if (parsed.port && parsed.port !== '443') {
      return { valid: false, error: 'bad URL: port must be 443 or omitted' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'bad URL: scheme must be https' };
  }
}

export function validateGitHubUrl(urlStr: string): ValidationResult {
  const baseRes = validateProductUrl(urlStr);
  if (!baseRes.valid) return baseRes;

  if (urlStr.startsWith(ALLOWED_PREFIX)) {
    const cleanPath = urlStr.split('?')[0];
    if (!cleanPath.endsWith('.md') && !cleanPath.endsWith('.html')) {
      return { valid: false, error: 'GitHub raw source URL must end with .md or .html' };
    }
  }
  return { valid: true };
}

export function validateProductName(name: string): ValidationResult {
  if (!name || name.length < 3 || name.length > 60 || !isPureAscii(name)) {
    return { valid: false, error: 'bad name' };
  }
  return { valid: true };
}

export function validateRuleText(ruleText: string): ValidationResult {
  if (!ruleText || ruleText.length < 10 || ruleText.length > 200 || !isPureAscii(ruleText)) {
    return { valid: false, error: 'bad rule text' };
  }
  return { valid: true };
}

export function validateThresholds(minFull: number, minHalf: number): ValidationResult {
  if (!Number.isInteger(minFull) || !Number.isInteger(minHalf)) {
    return { valid: false, error: 'bad thresholds' };
  }
  if (minFull < 2 || minFull > 10080) {
    return { valid: false, error: 'bad thresholds' };
  }
  if (minHalf < 1 || minHalf >= minFull) {
    return { valid: false, error: 'bad thresholds' };
  }
  return { valid: true };
}

export function validatePremiumRate(premiumBps: number): ValidationResult {
  if (!Number.isInteger(premiumBps) || premiumBps < 100 || premiumBps > 5000) {
    return { valid: false, error: 'bad premium rate' };
  }
  return { valid: true };
}

export function validatePositiveAmount(amount: number): ValidationResult {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { valid: false, error: 'bad amount' };
  }
  return { valid: true };
}

export function validateCreateProductInput(input: {
  name: string;
  sourceUrl: string;
  payout100Threshold: number;
  payout50Threshold: number;
  premiumBps: number;
  initialDeposit?: number;
}): ValidationResult {
  const nameRes = validateProductName(input.name);
  if (!nameRes.valid) return nameRes;

  const urlRes = validateGitHubUrl(input.sourceUrl);
  if (!urlRes.valid) return urlRes;

  const threshRes = validateThresholds(input.payout100Threshold, input.payout50Threshold);
  if (!threshRes.valid) return threshRes;

  const premRes = validatePremiumRate(input.premiumBps);
  if (!premRes.valid) return premRes;

  if (input.initialDeposit !== undefined && input.initialDeposit <= 0) {
    return { valid: false, error: 'bad amount' };
  }

  return { valid: true };
}

export function validateBuyPolicyInput(
  coverage: number,
  _days?: number,
  availableLiquidity?: number
): ValidationResult {
  if (!Number.isInteger(coverage) || coverage <= 0) {
    return { valid: false, error: 'bad coverage' };
  }
  if (availableLiquidity !== undefined && coverage > availableLiquidity) {
    return { valid: false, error: 'insufficient unreserved pool balance' };
  }
  return { valid: true };
}

export function validateFundPoolInput(amount: number): ValidationResult {
  return validatePositiveAmount(amount);
}

export function validateWithdrawPoolInput(
  amount: number,
  availableLiquidity: number
): ValidationResult {
  const pos = validatePositiveAmount(amount);
  if (!pos.valid) return pos;
  if (amount > availableLiquidity) {
    return { valid: false, error: 'insufficient unreserved pool balance' };
  }
  return { valid: true };
}

export function validateUpdateSourceUrlInput(urlStr: string): ValidationResult {
  return validateGitHubUrl(urlStr);
}
