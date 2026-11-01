export interface ErrorExplanation {
  plainMessage: string;
  nextStep: string;
  contract: 'Cover' | 'CoverGuard' | 'Common';
}

export const ERROR_MAPPINGS: Record<string, ErrorExplanation> = {
  // --- URL Validation Errors ---
  "bad URL: length must be between 1 and 300 characters": {
    plainMessage: "The provided source URL is either empty or longer than 300 characters.",
    nextStep: "Shorten the URL or use a direct HTTPS endpoint under 300 characters.",
    contract: "Cover",
  },
  "bad URL: must be pure ASCII": {
    plainMessage: "The source URL contains international, Unicode, or non-ASCII characters.",
    nextStep: "Convert any non-ASCII domain characters to Punycode or standard ASCII.",
    contract: "Cover",
  },
  "bad URL: scheme must be https": {
    plainMessage: "The source URL does not use the secure HTTPS protocol.",
    nextStep: "Use an https:// URL; plain http:// is rejected by the contract.",
    contract: "Cover",
  },
  "bad URL: userinfo not allowed": {
    plainMessage: "The source URL contains embedded credentials (e.g., user:pass@host).",
    nextStep: "Remove user credentials from the URL.",
    contract: "Cover",
  },
  "bad URL: fragment not allowed": {
    plainMessage: "The source URL contains a hash fragment identifier (#section).",
    nextStep: "Remove the # anchor fragment from the URL.",
    contract: "Cover",
  },
  "bad URL: missing host": {
    plainMessage: "The source URL has no hostname or domain specified.",
    nextStep: "Specify a fully qualified domain name (e.g. status.company.com).",
    contract: "Cover",
  },
  "bad URL: IP literals not allowed": {
    plainMessage: "The source URL uses a raw IPv4 or IPv6 numerical address.",
    nextStep: "Use a public DNS hostname instead of an IP literal.",
    contract: "Cover",
  },
  "bad URL: port must be 443 or omitted": {
    plainMessage: "The source URL specifies a custom port number other than 443.",
    nextStep: "Omit the port number or specify port 443.",
    contract: "Cover",
  },

  // --- Product & Credit Setup Errors ---
  "already claimed demo credits": {
    plainMessage: "This wallet has already claimed its one-time allotment of 1,000 demo credits.",
    nextStep: "Use existing demo credits in this wallet, or switch to a new wallet address.",
    contract: "Cover",
  },
  "bad name": {
    plainMessage: "The product name must be pure ASCII between 3 and 60 characters.",
    nextStep: "Enter a descriptive ASCII product name between 3 and 60 characters.",
    contract: "Cover",
  },
  "bad rule text": {
    plainMessage: "The rule description text must be pure ASCII between 10 and 200 characters.",
    nextStep: "Provide clear ASCII rule text between 10 and 200 characters.",
    contract: "Cover",
  },
  "bad thresholds": {
    plainMessage: "Outage thresholds are invalid: min_full must be 2-10080 min, and min_half must be 1 to (min_full - 1).",
    nextStep: "Adjust thresholds so min_half is strictly less than min_full.",
    contract: "Cover",
  },
  "bad premium rate": {
    plainMessage: "The premium rate must be between 100 bps (1%) and 5,000 bps (50%).",
    nextStep: "Set a premium rate between 100 bps (1%) and 5,000 bps (50%).",
    contract: "Cover",
  },
  "bad amount": {
    plainMessage: "The specified credit amount is invalid (must be a positive integer).",
    nextStep: "Enter an integer greater than zero.",
    contract: "Cover",
  },
  "unknown product": {
    plainMessage: "The specified product ID does not exist in the contract registry.",
    nextStep: "Verify the product ID or browse active products from the directory.",
    contract: "Cover",
  },
  "unknown policy": {
    plainMessage: "The specified policy ID does not exist on-chain.",
    nextStep: "Check the policy ID in your active policies list.",
    contract: "Cover",
  },
  "unknown settlement": {
    plainMessage: "The specified settlement observation ID does not exist.",
    nextStep: "Verify the settlement ID on the policy page.",
    contract: "Cover",
  },

  // --- Pool & Funding Errors ---
  "insufficient balance": {
    plainMessage: "Your wallet balance has fewer demo credits than the requested operation requires.",
    nextStep: "Claim demo credits on the Credits page or reduce the amount.",
    contract: "Cover",
  },
  "not creator": {
    plainMessage: "Only the underwriter address that created this product can withdraw or update its source.",
    nextStep: "Switch wallet to the product creator account.",
    contract: "Cover",
  },
  "withdraw exceeds unreserved": {
    plainMessage: "The requested withdrawal exceeds free unreserved credits in the product pool.",
    nextStep: "Check pool health and withdraw an amount less than or equal to unreserved pool balance.",
    contract: "Cover",
  },
  "host or directory mismatch on update_source": {
    plainMessage: "The updated source URL must share the exact same host and directory path as the original product terms.",
    nextStep: "Keep the exact domain and folder path identical; only filename or query updates are permitted.",
    contract: "Cover",
  },
  "pool cannot cover this coverage": {
    plainMessage: "The product pool lacks sufficient free capital to cover this policy at this time.",
    nextStep: "Request the underwriter fund more credits, or purchase a smaller coverage amount.",
    contract: "Cover",
  },

  // --- Purchase & Settlement Web Extraction Errors ---
  "event already in progress or status unclear at purchase": {
    plainMessage: "Purchase refused: the target service is currently reporting an outage or degraded performance.",
    nextStep: "Cover can only be purchased while the monitored service is fully OPERATIONAL.",
    contract: "Cover",
  },
  "policy not active": {
    plainMessage: "This policy cannot be settled or cancelled because it is no longer ACTIVE (already PAID or CANCELLED).",
    nextStep: "View the settlement record or purchase a new policy.",
    contract: "Cover",
  },
  "not holder": {
    plainMessage: "Only the policy holder address can cancel this policy.",
    nextStep: "Connect the wallet that purchased the policy.",
    contract: "Cover",
  },
  "source unreachable": {
    plainMessage: "Validators could not fetch the status page URL (DNS, connection, or timeout failure).",
    nextStep: "Verify the public status page is reachable and try again.",
    contract: "Cover",
  },
  "page too large": {
    plainMessage: "The status page content exceeded the maximum contract size limit of 400,000 bytes.",
    nextStep: "Point to a lightweight status page or markdown feed under 400 KB.",
    contract: "Cover",
  },
  "page unreadable": {
    plainMessage: "Cleaned text extracted from the status page was under 200 characters, indicating incomplete content or client-side rendering.",
    nextStep: "Ensure the page returns static HTML or markdown without client-side JavaScript rendering.",
    contract: "Cover",
  },

  // --- Prefix-matched Templates ---
  "HTTP status not 200:": {
    plainMessage: "The status page web server returned an HTTP error code instead of HTTP 200 OK.",
    nextStep: "Ensure the target page URL exists and is publicly accessible without authentication.",
    contract: "Cover",
  },
  "duplicate observation:": {
    plainMessage: "This policy was already settled against identical page content in a prior observation.",
    nextStep: "Wait until the status page updates with new incident information before settling again.",
    contract: "Cover",
  },

  // --- CoverGuard Errors ---
  "unknown attestation": {
    plainMessage: "The specified attestation ID does not exist in CoverGuard.",
    nextStep: "Verify the attestation ID on the CoverGuard inspector page.",
    contract: "CoverGuard",
  },
  "not covered:": {
    plainMessage: "CoverGuard verification failed: the policy does not provide valid active coverage.",
    nextStep: "Check policy status, holder address, and product pool balance.",
    contract: "CoverGuard",
  },
  "not covered: NO_POLICY": {
    plainMessage: "CoverGuard verification failed: policy ID was not found.",
    nextStep: "Provide a valid existing policy ID.",
    contract: "CoverGuard",
  },
  "not covered: NOT_HOLDER": {
    plainMessage: "CoverGuard verification failed: connected wallet is not the policy holder.",
    nextStep: "Switch wallet to the holder address.",
    contract: "CoverGuard",
  },
  "not covered: PAID": {
    plainMessage: "CoverGuard verification failed: policy has already settled and paid out.",
    nextStep: "Purchase a fresh active policy for new coverage.",
    contract: "CoverGuard",
  },
  "not covered: CANCELLED": {
    plainMessage: "CoverGuard verification failed: policy was cancelled by holder.",
    nextStep: "Purchase a fresh active policy.",
    contract: "CoverGuard",
  },
  "not covered: POOL_SHORT": {
    plainMessage: "CoverGuard verification failed: product pool balance is less than policy coverage.",
    nextStep: "Underwriter must fund the pool before attestation can succeed.",
    contract: "CoverGuard",
  },
};

export function mapContractError(raw: unknown): ErrorExplanation {
  const rawStr = typeof raw === 'string' 
    ? raw 
    : (raw && typeof raw === 'object' && 'message' in raw) 
      ? String((raw as { message: unknown }).message) 
      : String(raw || '');

  // Exact match
  if (ERROR_MAPPINGS[rawStr]) {
    return ERROR_MAPPINGS[rawStr];
  }

  // Prefix match
  for (const [key, val] of Object.entries(ERROR_MAPPINGS)) {
    if (rawStr.startsWith(key)) {
      return val;
    }
    // Handle embedded f-string prefix matches
    if (key.includes('{') || key.endsWith(':')) {
      const cleanKey = key.split('{')[0].trim();
      if (rawStr.includes(cleanKey)) {
        return val;
      }
    }
  }

  // Fallback for unknown or complex RPC errors
  return {
    plainMessage: rawStr || "An unknown contract execution error occurred.",
    nextStep: "Inspect the raw transaction on the explorer or review parameters.",
    contract: "Common",
  };
}

export function formatUserError(raw: unknown): { title: string; explanation: string; action?: string } {
  const mapped = mapContractError(raw);
  return {
    title: `${mapped.contract} User Rejection`,
    explanation: mapped.plainMessage,
    action: mapped.nextStep,
  };
}

