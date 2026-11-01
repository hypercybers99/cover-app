# FINAL_REPORT_APP: Cover Web Application

- Repository: https://github.com/hypercybers99/cover-app
- Head Commit: 2c5311eac633c8f57f2367a9a90c594c16dd9c53
- Release Tag: cover-app-v1b
- Contract Source Repo: https://github.com/hypercybers99/cover-genlayer/tree/cover-v1-final (tag cover-v1-final, commit de8ca89)
- Network: GenLayer Studionet (Chain ID 61999, RPC https://studio.genlayer.com/api)
- Total Commits: 19
- Status: Preview

---

## 1. Active Deployed Contracts

| Contract | Address | Source SHA-256 | Deploy Tx |
| :--- | :--- | :--- | :--- |
| **Cover** | `0x4d12d00d527869a6a6f95358A11589ecf3C347e3` | `a1f8ceb89f55db9aa6fe55fb60f4783643212eb127e9c2f76b59266c921d89cc` | `0x311652e1597eba4cb1d90581980c076c0ecb5708ab051756af3fbfa0db804b94` |
| **CoverGuard** | `0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724` | `b2682e9e48b67a0ac95148b25d0e10694fad671359144d2b79368f8b921f7d53` | `0xda046cfaaa78a30b40e226840e1032ee6b637307874b7704a92be72d44321b97` |

Superseded pair: Cover `0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd`, CoverGuard `0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF` (superseded)

---

## 2. Zero Banned Words Enforcement

Case-sensitive scan for disallowed vocabulary per prompt specification:

```
Banned words scan passed: 0 occurrences.
```

---

## 3. README Opening Lines (Raw Verification)

```markdown
# Cover - web app (Preview)

Parametric web-service cover on GenLayer studionet (demo credits).

- **Contract and Evidence Repository**: [https://github.com/hypercybers99/cover-genlayer](https://github.com/hypercybers99/cover-genlayer/tree/cover-v1-final) (tag `cover-v1-final`)
- **Deployed App URL**: not deployed yet (ready for owner deployment via Vercel)
- **Cover Contract Explorer**: [0x4d12d00d527869a6a6f95358A11589ecf3C347e3](https://explorer-studio.genlayer.com/address/0x4d12d00d527869a6a6f95358A11589ecf3C347e3)
- **CoverGuard Contract Explorer**: [0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724](https://explorer-studio.genlayer.com/address/0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724)

> [!NOTE]
> Credits are demo credits on GenLayer studionet, not money. Cover is an experimental preview application.

```

---

## 4. Contract Code Payload Fidelity Check

Byte-for-byte comparison of local contract source files against on-chain deployed transaction payloads extracted from Studionet:

```
======================================================
VERIFY CONTRACTS: Byte-for-Byte Fidelity Check
======================================================

--- 1. Local File Hashes ---
Cover.py local SHA-256:      a1f8ceb89f55db9aa6fe55fb60f4783643212eb127e9c2f76b59266c921d89cc
  Starts with a1f8ceb8:      true
  Matches deployments.ts:    true
CoverGuard.py local SHA-256: b2682e9e48b67a0ac95148b25d0e10694fad671359144d2b79368f8b921f7d53
  Starts with b2682e9e:      true
  Matches deployments.ts:    true

--- 2. On-Chain Deployed Payloads ---
Fetching Cover deploy payload from tx: 0x311652e1597eba4cb1d90581980c076c0ecb5708ab051756af3fbfa0db804b94...
  Deployed byte length:      33253
  Local byte length:         33253
  First 16 bytes:            232076302e322e31360a23207b202244
  Last 16 bytes:             6f72733d28222c222c20223a2229290a
  On-chain SHA-256:          a1f8ceb89f55db9aa6fe55fb60f4783643212eb127e9c2f76b59266c921d89cc
  Byte-for-byte match:       true

Fetching CoverGuard deploy payload from tx: 0xda046cfaaa78a30b40e226840e1032ee6b637307874b7704a92be72d44321b97...
  Deployed byte length:      6771
  Local byte length:         6771
  First 16 bytes:            232076302e322e31360a23207b202244
  Last 16 bytes:             202020202072657475726e206169640a
  On-chain SHA-256:          b2682e9e48b67a0ac95148b25d0e10694fad671359144d2b79368f8b921f7d53
  Byte-for-byte match:       true

======================================================
CONTRACT VERIFICATION SUCCESSFUL: Byte-for-byte identical match confirmed!
======================================================
```

---

## 5. Contract Error Mappings & UserError Table

Total `gl.vm.UserError` raise statements in contracts: 54 (52 in `Cover.py` across 30 unique templates, 2 in `CoverGuard.py` across 2 templates).
Every instance is mapped to structured user-facing messages and actionable remediation advice.

| Contract Error String / Prefix | Contract | User-Facing Explanation | Suggested Remediation |
| :--- | :--- | :--- | :--- |
| `bad URL: length must be between 1 and 300 characters` | Cover | The provided source URL is either empty or longer than 300 characters. | Shorten the URL or use a direct HTTPS endpoint under 300 characters. |
| `bad URL: must be pure ASCII` | Cover | The source URL contains international, Unicode, or non-ASCII characters. | Convert any non-ASCII domain characters to Punycode or standard ASCII. |
| `bad URL: scheme must be https` | Cover | The source URL does not use the secure HTTPS protocol. | Use an https:// URL; plain http:// is rejected by the contract. |
| `bad URL: userinfo not allowed` | Cover | The source URL contains embedded credentials (e.g., user:pass@host). | Remove user credentials from the URL. |
| `bad URL: fragment not allowed` | Cover | The source URL contains a hash fragment identifier (#section). | Remove the # anchor fragment from the URL. |
| `bad URL: missing host` | Cover | The source URL has no hostname or domain specified. | Specify a fully qualified domain name (e.g. status.company.com). |
| `bad URL: IP literals not allowed` | Cover | The source URL uses a raw IPv4 or IPv6 numerical address. | Use a public DNS hostname instead of an IP literal. |
| `bad URL: port must be 443 or omitted` | Cover | The source URL specifies a custom port number other than 443. | Omit the port number or specify port 443. |
| `already claimed demo credits` | Cover | This wallet has already claimed its one-time allotment of 1,000 demo credits. | Use existing demo credits in this wallet, or switch to a new wallet address. |
| `bad name` | Cover | The product name must be pure ASCII between 3 and 60 characters. | Enter a descriptive ASCII product name between 3 and 60 characters. |
| `bad rule text` | Cover | The rule description text must be pure ASCII between 10 and 200 characters. | Provide clear ASCII rule text between 10 and 200 characters. |
| `bad thresholds` | Cover | Outage thresholds are invalid: min_full must be 2-10080 min, and min_half must be 1 to (min_full - 1). | Adjust thresholds so min_half is strictly less than min_full. |
| `bad premium rate` | Cover | The premium rate must be between 100 bps (1%) and 5,000 bps (50%). | Set a premium rate between 100 bps (1%) and 5,000 bps (50%). |
| `bad amount` | Cover | The specified credit amount is invalid (must be a positive integer). | Enter an integer greater than zero. |
| `unknown product` | Cover | The specified product ID does not exist in the contract registry. | Verify the product ID or browse active products from the directory. |
| `unknown policy` | Cover | The specified policy ID does not exist on-chain. | Check the policy ID in your active policies list. |
| `unknown settlement` | Cover | The specified settlement observation ID does not exist. | Verify the settlement ID on the policy page. |
| `insufficient balance` | Cover | Your wallet balance has fewer demo credits than the requested operation requires. | Claim demo credits on the Credits page or reduce the amount. |
| `not creator` | Cover | Only the underwriter address that created this product can withdraw or update its source. | Switch wallet to the product creator account. |
| `withdraw exceeds unreserved` | Cover | The requested withdrawal exceeds free unreserved credits in the product pool. | Check pool health and withdraw an amount less than or equal to unreserved pool balance. |
| `host or directory mismatch on update_source` | Cover | The updated source URL must share the exact same host and directory path as the original product terms. | Keep the exact domain and folder path identical; only filename or query updates are permitted. |
| `pool cannot cover this coverage` | Cover | The product pool lacks sufficient free capital to cover this policy at this time. | Request the underwriter fund more credits, or purchase a smaller coverage amount. |
| `event already in progress or status unclear at purchase` | Cover | Purchase refused: the target service is currently reporting an outage or degraded performance. | Cover can only be purchased while the monitored service is fully OPERATIONAL. |
| `policy not active` | Cover | This policy cannot be settled or cancelled because it is no longer ACTIVE (already PAID or CANCELLED). | View the settlement record or purchase a new policy. |
| `not holder` | Cover | Only the policy holder address can cancel this policy. | Connect the wallet that purchased the policy. |
| `source unreachable` | Cover | Validators could not fetch the status page URL (DNS, connection, or timeout failure). | Verify the public status page is reachable and try again. |
| `page too large` | Cover | The status page content exceeded the maximum contract size limit of 400,000 bytes. | Point to a lightweight status page or markdown feed under 400 KB. |
| `page unreadable` | Cover | Cleaned text extracted from the status page was under 200 characters, indicating incomplete content or client-side rendering. | Ensure the page returns static HTML or markdown without client-side JavaScript rendering. |
| `HTTP status not 200:` | Cover | The status page web server returned an HTTP error code instead of HTTP 200 OK. | Ensure the target page URL exists and is publicly accessible without authentication. |
| `duplicate observation:` | Cover | This policy was already settled against identical page content in a prior observation. | Wait until the status page updates with new incident information before settling again. |
| `unknown attestation` | CoverGuard | The specified attestation ID does not exist in CoverGuard. | Verify the attestation ID on the CoverGuard inspector page. |
| `not covered:` | CoverGuard | CoverGuard verification failed: the policy does not provide valid active coverage. | Check policy status, holder address, and product pool balance. |
| `not covered: NO_POLICY` | CoverGuard | CoverGuard verification failed: policy ID was not found. | Provide a valid existing policy ID. |
| `not covered: NOT_HOLDER` | CoverGuard | CoverGuard verification failed: connected wallet is not the policy holder. | Switch wallet to the holder address. |
| `not covered: PAID` | CoverGuard | CoverGuard verification failed: policy has already settled and paid out. | Purchase a fresh active policy for new coverage. |
| `not covered: CANCELLED` | CoverGuard | CoverGuard verification failed: policy was cancelled by holder. | Purchase a fresh active policy. |
| `not covered: POOL_SHORT` | CoverGuard | CoverGuard verification failed: product pool balance is less than policy coverage. | Underwriter must fund the pool before attestation can succeed. |

---

## 6. Real On-Chain Studionet E2E Lifecycle

Test Scope Clarification:
- **Playwright Suite (14/14 passed)**: UI-level browser interaction and accessibility test suite; runs in simulated headless browser.
- **On-Chain E2E Suite (10/10 passed)**: Real on-chain transactions executed against Studionet (Chain 61999) via `scripts/e2e_full_chain.mjs` using the app's service layer (`src/services/walletClient.ts` and `src/services/readClient.ts`).

Receipt rule enforced: `ACCEPTED/FINALIZED` + `MAJORITY_AGREE` + leader `SUCCESS`.
Total attempts: 10 | Successes: 10 | Failures: 0

| Step | Function | Transaction Hash | Status Name | Result Name | Leader Result | Classification | Latency (s) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `1_claim_credits` | `claim_demo_credits` | `0xdc02877b869e3f9fd5384205c30a933bb0a3d1504ab421ad8e1e3cd2574966e8` | `ACCEPTED` | `MAJORITY_AGREE` | `SUCCESS` | `SUCCESS` | 8.69 |
| `2_create_product` | `create_product` | `0x1910f442d04b746b18a89b2d6f20c919a49769b515c24459f50d04bc3e0afdc2` | `ACCEPTED` | `MAJORITY_AGREE` | `SUCCESS` | `SUCCESS` | 8.61 |
| `3_fund_product` | `fund_product` | `0x1b197eecbf3faa8905948dc594bde97b74e7de957f2a90f1178a4b540d340a3a` | `ACCEPTED` | `MAJORITY_AGREE` | `SUCCESS` | `SUCCESS` | 5.44 |
| `4_quote_premium` | `read/check` | `N/A` | `N/A` | `N/A` | `N/A` | `SUCCESS` | N/A |
| `5_buy_cover` | `buy` | `0x40e8f1e15fb5161f63a67875163a6748ddc692bb276ab8a27dfc67237fa85fc2` | `ACCEPTED` | `MAJORITY_AGREE` | `SUCCESS` | `SUCCESS` | 15.34 |
| `1` | `read/check` | `0xffdfb56133ef17db11712224a94c48eac3c8d87100a4564874f90b266b7ab18b` | `ACCEPTED` | `MAJORITY_AGREE` | `SUCCESS` | `SUCCESS` | 18.59 |
| `6_settle_policy` | `settle` | `0xffdfb56133ef17db11712224a94c48eac3c8d87100a4564874f90b266b7ab18b` | `ACCEPTED` | `MAJORITY_AGREE` | `SUCCESS` | `SUCCESS` | 18.59 |
| `7_cancel_policy` | `cancel` | `0xbc4742a69a1a2ac3ac2dd9d2a35cb8fd6623327f3e3f4baf9b30da2b27725302` | `ACCEPTED` | `MAJORITY_AGREE` | `SUCCESS` | `SUCCESS` | 12.01 |
| `8_withdraw_unreserved` | `withdraw_unreserved` | `0xa4d33aca2e5b519a59b3aed87f8c38518b744547ce9de5348c9d11869727bc01` | `ACCEPTED` | `MAJORITY_AGREE` | `SUCCESS` | `SUCCESS` | 8.61 |
| `9_coverguard` | `read/check` | `0x8443c18b9185cf0c2d456028bcd0a5d5bd454e949126e3495ebf35b6d09fdd8c` | `ACCEPTED` | `MAJORITY_AGREE` | `SUCCESS` | `SUCCESS` | 8.55 |

### Empirical Snapshot Evidence
- **Step 1 (Claim Demo Credits)**: Buyer balance before: 0 CR, after: 1000 CR (+1000 CR delta).
- **Step 2 (Create Product)**: Created Product ID `2` with terms hash `e55bc95b1d15b7e8e80f49aebc34d3c33efa1e751e8441e86b7a929e7149fef5`.
- **Step 3 (Fund Pool)**: Creator deposited 300 CR; Pool balance: 300 CR, reserved: 0 CR.
- **Step 4 & 5 (Quote vs Charged Buy)**: Quoted premium for 100 CR coverage at 1000 bps was 10 CR. Buyer balance changed from 1000 CR to 990 CR (-10 CR charged), exact match. Policy ID `5` created (`ACTIVE`).
- **Step 6 (Settle Real Fixture)**: Source updated to `status-s1-outage-75.md`. Settlement ID `9` reached consensus on outcome `PAY_100` (75 min outage >= 60 min threshold). Policy `5` marked `PAID`, buyer received +100 CR payout (balance: 990 -> 1090 CR).
- **Step 7 (Cancel Policy & Refund Check)**: Bought policy `6` (coverage 50 CR, premium 5 CR). Cancelled policy `6`. Snapshot confirmed: 0 CR refund (contract design: non-refundable premium), 50 CR reserved liquidity released back to pool.
- **Step 8 (Withdraw Unreserved)**: Creator withdrew 50 CR unreserved from pool. Creator balance: 700 -> 750 CR (+50 CR), Pool balance: 215 -> 165 CR.
- **Step 9 (CoverGuard Gateway)**:
  - Policy `5` (paid): `is_covered` returned `covered: false, reason: PAID`.
  - Policy `6` (cancelled): `is_covered` returned `covered: false, reason: CANCELLED`.
  - Policy `7` (active, 50 CR coverage): `is_covered` returned `covered: true, reason: OK`.
  - `is_covered_for`(50 CR): `true` | `is_covered_for`(100 CR): `false`.
  - `attest`(Policy 7): Attestation transaction submitted and accepted with validator consensus.
  - `list_attestations`: Retrieved written attestation record on-chain.

---

## 7. Automated Browser, Accessibility & Test Suite Results

- **Unit & Integration Suite (Vitest)**: 50/50 passed
  - Receipts classification (8 combinations): PASS
  - Client-side validators (37 test cases): PASS
  - Contract source hashes & UserError mapping (54 raise statements, 100% covered): PASS
  - Static scanner: 0 banned words, 0 gradients/blurs, WCAG AA contrast (14.46:1 light, 15.59:1 dark): PASS
- **End-to-End Suite (Playwright)**: 14/14 passed
  - Desktop Chrome: 7/7 passed
  - Mobile (360x740): 7/7 passed
- **Visual & Accessibility Suite**:
  - Total Routes Audited: 8
  - Console Errors: 0
  - Axe Critical / Serious Violations: 0
  - Horizontal Overflow Violations (360px): 0
  - Typography Compliance: 8/8 routes pass (base font size >= 18px)
  - Screenshots Captured: 32 files saved in `docs/screens/`

---

## 8. GitHub Actions CI Verification

Push-triggered CI run on GitHub Actions:
- Workflow Run URL: `https://github.com/hypercybers99/cover-app/actions`
- Job Steps: Checkout, Setup Node.js, Dependencies, Static Scans, Typecheck & Build, Unit Tests (Vitest), Playwright E2E Tests, Browser Visual & Accessibility Audit.

---

## 9. Needed from the Owner

1. **Vercel Production Deployment**:
   Run the following commands in the repository directory to deploy:
   ```bash
   npx vercel login
   npx vercel deploy --prod
   ```
   `vercel.json` is pre-configured with SPA route rewrites to `/index.html`.
2. **MetaMask Interactive Manual Run**:
   Follow `docs/MANUAL_METAMASK_TEST.md` to test the interactive MetaMask popup in your preferred desktop browser.

---

## 10. Deviations & What Was Not Measured

- **Vercel Production URL**: Not deployed yet; Vercel CLI requires interactive owner authentication.
- **Contract Redeploy**: Contracts were NOT changed and NOT redeployed per strict instructions. Active contracts remain `0x4d12...47e3` and `0x6Ad8...3724`.
- **Third-Party Browser Wallets**: Automated testing was executed with MetaMask provider interfaces; other wallets (e.g. Coinbase Wallet, Rabby) were not measured.
