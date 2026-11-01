export interface ValidationResult {
  valid: boolean;
  error?: string;
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
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(host)) return true;
  // IPv6 check: contains colon and hex chars
  if (host.includes(':')) return true;
  // Bracketed IPv6 e.g. [::1]
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
