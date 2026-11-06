# FINAL_REPORT_APP: Cover Web Application (V2)

- Repository: https://github.com/hypercybers99/cover-app
- Head Commit: 53c3d5ea9a3eebf7805ef8883d8a61ef30439afe
- Release Tag: cover-app-v2c
- Deployed Application URL: https://hypercybers99.github.io/cover-app/
- Contract Source Repo: https://github.com/hypercybers99/cover-genlayer/tree/cover-v2 (tag cover-v2c, commit 61ec137)
- Network: GenLayer Studionet (Chain ID 61999, RPC https://studio.genlayer.com/api)
- Total Commits: 34
- Status: Preview

---

## 1. Active Deployed Contracts (V2)

| Contract | Address | Source SHA-256 | Deploy Tx |
| :--- | :--- | :--- | :--- |
| **Cover V2** | `0x3d2698cED9292689f68b401e888fbA1d18CBfdE3` | `0b2f91d2b64dee1dce4aa13c15c19c274546dd64fff8b738325067c37a12b296` | `0x3f4ef296da9e609ba83dc5ed5c866910e26fd7eb9055273142683618b5e8a8a8` |
| **CoverGuard V2** | `0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A` | `e0546c62266e7ab13b0aaa70489ada2625849742f004cb21732aaef03cd901a1` | `0xdecd58ff74a091ed5b1e7ddb8f188402d1e06ebf92517147cb92199e14fd0b3e` |

### Superseded Deployments

| Version | Cover Address | CoverGuard Address | Status |
| :--- | :--- | :--- | :--- |
| **V1** | `0x4d12d00d527869a6a6f95358A11589ecf3C347e3` | `0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724` | Superseded, kept for history |
| **V0** | `0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd` | `0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF` | Superseded, kept for history |

---

## 2. Zero Banned Words Enforcement

```
Banned words scan passed: 0 occurrences.
```

---

## 3. README Opening Lines (Raw Verification)

```markdown
# Cover - web app (Preview)

Parametric web-service cover on GenLayer studionet (demo credits).

- **Contract and Evidence Repository**: [https://github.com/hypercybers99/cover-genlayer](https://github.com/hypercybers99/cover-genlayer/tree/cover-v2) (tag `cover-v2`)
- **Deployed App URL**: [https://hypercybers99.github.io/cover-app/](https://hypercybers99.github.io/cover-app/)
- **Cover V2 Contract Explorer**: [0x3d2698cED9292689f68b401e888fbA1d18CBfdE3](https://explorer-studio.genlayer.com/address/0x3d2698cED9292689f68b401e888fbA1d18CBfdE3)
- **CoverGuard V2 Contract Explorer**: [0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A](https://explorer-studio.genlayer.com/address/0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A)

> [!NOTE]
> Credits are demo credits on GenLayer studionet, not money. Cover is an experimental preview application.
```

---

## 4. Contract Code Payload Fidelity Check

```
======================================================
VERIFY CONTRACTS: Byte-for-Byte Fidelity Check
======================================================

--- 1. Local File Hashes ---
Cover.py local SHA-256:      0b2f91d2b64dee1dce4aa13c15c19c274546dd64fff8b738325067c37a12b296
  Starts with 0b2f91d2:      true
  Matches deployments.ts:    true
CoverGuard.py local SHA-256: e0546c62266e7ab13b0aaa70489ada2625849742f004cb21732aaef03cd901a1
  Starts with e0546c62:      true
  Matches deployments.ts:    true

--- 2. On-Chain Deployed Payloads ---
Fetching Cover deploy payload from tx: 0x3f4ef296da9e609ba83dc5ed5c866910e26fd7eb9055273142683618b5e8a8a8...
  Deployed byte length:      33405
  Local byte length:         33405
  First 16 bytes:            232076302e322e31360a23207b202244
  Last 16 bytes:             436f7665725632203d20436f7665720a
  On-chain SHA-256:          0b2f91d2b64dee1dce4aa13c15c19c274546dd64fff8b738325067c37a12b296
  Byte-for-byte match:       true

Fetching CoverGuard deploy payload from tx: 0xdecd58ff74a091ed5b1e7ddb8f188402d1e06ebf92517147cb92199e14fd0b3e...
  Deployed byte length:      7145
  Local byte length:         7145
  First 16 bytes:            232076302e322e31360a23207b202244
  Last 16 bytes:             5632203d20436f76657247756172640a
  On-chain SHA-256:          e0546c62266e7ab13b0aaa70489ada2625849742f004cb21732aaef03cd901a1
  Byte-for-byte match:       true

======================================================
CONTRACT VERIFICATION SUCCESSFUL: Byte-for-byte identical match confirmed!
======================================================
```

---

## 5. Contract Error Mappings & UserError Table

Total `gl.vm.UserError` raise statements in contracts: 52 (50 in `Cover.py` across 29 unique templates, 2 in `CoverGuard.py` across 2 templates).
Every instance is mapped to structured user-facing messages and actionable remediation advice directly from `src/lib/errors.ts`:

| Contract Error String / Prefix | Contract | User-Facing Explanation | Suggested Remediation |
| :--- | :--- | :--- | :--- |
| `already claimed demo credits` | Cover | This wallet has already claimed its one-time allotment of 1,000 demo credits. | Use existing demo credits in this wallet, or switch to a new wallet address. |
| `bad amount` | Cover | The specified credit amount is invalid (must be a positive integer). | Enter an integer greater than zero. |
| `bad name` | Cover | The product name must be pure ASCII between 3 and 60 characters. | Enter a descriptive ASCII product name between 3 and 60 characters. |
| `bad premium rate` | Cover | The premium rate must be between 100 bps (1%) and 5,000 bps (50%). | Set a premium rate between 100 bps (1%) and 5,000 bps (50%). |
| `bad thresholds` | Cover | Outage thresholds are invalid: min_full must be 2-10080 min, and min_half must be 1 to (min_full - 1). | Adjust thresholds so min_half is strictly less than min_full. |
| `bad URL: fragment not allowed` | Cover | The source URL contains a hash fragment identifier (#section). | Remove the # anchor fragment from the URL. |
| `bad URL: IP literals not allowed` | Cover | The source URL uses a raw IPv4 or IPv6 numerical address. | Use a public DNS hostname instead of an IP literal. |
| `bad URL: length must be between 1 and 300 characters` | Cover | The provided source URL is either empty or longer than 300 characters. | Shorten the URL or use a direct HTTPS endpoint under 300 characters. |
| `bad URL: missing host` | Cover | The source URL has no hostname or domain specified. | Specify a fully qualified domain name (e.g. status.company.com). |
| `bad URL: must be pure ASCII` | Cover | The source URL contains international, Unicode, or non-ASCII characters. | Convert any non-ASCII domain characters to Punycode or standard ASCII. |
| `bad URL: port must be 443 or omitted` | Cover | The source URL specifies a custom port number other than 443. | Omit the port number or specify port 443. |
| `bad URL: scheme must be https` | Cover | The source URL does not use the secure HTTPS protocol. | Use an https:// URL; plain http:// is rejected by the contract. |
| `bad URL: userinfo not allowed` | Cover | The source URL contains embedded credentials (e.g., user:pass@host). | Remove user credentials from the URL. |
| `duplicate observation:` | Cover | This policy was already settled against identical page content in a prior observation. | Wait until the status page updates with new incident information before settling again. |
| `event already in progress or status unclear at purchase` | Cover | Purchase refused: the target service is currently reporting an outage or degraded performance. | Cover can only be purchased while the monitored service is fully OPERATIONAL. |
| `host or directory mismatch on update_source` | Cover | The updated source URL must share the exact same host and directory path as the original product terms. | Keep the exact domain and folder path identical; only filename or query updates are permitted. |
| `HTTP status not 200:` | Cover | The status page web server returned an HTTP error code instead of HTTP 200 OK. | Ensure the target page URL exists and is publicly accessible without authentication. |
| `insufficient balance` | Cover | Your wallet balance has fewer demo credits than the requested operation requires. | Claim demo credits on the Credits page or reduce the amount. |
| `not covered:` | CoverGuard | CoverGuard verification failed: the policy does not provide valid active coverage (e.g. PAID, NOT_HOLDER, CANCELLED, POOL_SHORT, or NO_POLICY). | Check policy status, holder address, and product pool balance. |
| `not creator` | Cover | Only the underwriter address that created this product can withdraw or update its source. | Switch wallet to the product creator account. |
| `not holder` | Cover | Only the policy holder address can cancel this policy. | Connect the wallet that purchased the policy. |
| `page too large` | Cover | The status page content exceeded the maximum contract size limit of 400,000 bytes. | Point to a lightweight status page or markdown feed under 400 KB. |
| `page unreadable` | Cover | Cleaned text extracted from the status page was under 200 characters, indicating incomplete content or client-side rendering. | Ensure the page returns static HTML or markdown without client-side JavaScript rendering. |
| `policy not active` | Cover | This policy cannot be settled or cancelled because it is no longer ACTIVE (already PAID or CANCELLED). | View the settlement record or purchase a new policy. |
| `pool cannot cover this coverage` | Cover | The product pool lacks sufficient free capital to cover this policy at this time. | Request the underwriter fund more credits, or purchase a smaller coverage amount. |
| `source unreachable` | Cover | Validators could not fetch the status page URL (DNS, connection, or timeout failure). | Verify the public status page is reachable and try again. |
| `unknown attestation` | CoverGuard | The specified attestation ID does not exist in CoverGuard. | Verify the attestation ID on the CoverGuard inspector page. |
| `unknown policy` | Cover | The specified policy ID does not exist on-chain. | Check the policy ID in your active policies list. |
| `unknown product` | Cover | The specified product ID does not exist in the contract registry. | Verify the product ID or browse active products from the directory. |
| `unknown settlement` | Cover | The specified settlement observation ID does not exist. | Verify the settlement ID on the policy page. |
| `withdraw exceeds unreserved` | Cover | The requested withdrawal exceeds free unreserved credits in the product pool. | Check pool health and withdraw an amount less than or equal to unreserved pool balance. |

---

## 6. Visual & Styling Constraints

### A. Flat Styling Enforcement
```
Visual identity scan passed: 0 gradients, 0 glassmorphism.
```

### B. Contrast Ratio Audit (WCAG AA 4.5:1)
```
======================================================
CONTRAST RATIO AUDIT (WCAG AA 4.5:1)
======================================================
Light Ink on Page Bg                  : 14.46:1 (Min 4.5:1) -> PASS
White Text on Forest Green Primary    : 7.57:1 (Min 4.5:1) -> PASS
Light Clay Warning on Card Sand       : 6.25:1 (Min 4.5:1) -> PASS
Light Brick Error on Page Bg          : 6.74:1 (Min 4.5:1) -> PASS
Dark Off-white on Charcoal Bg         : 15.59:1 (Min 4.5:1) -> PASS
Dark Sage Success on Dark Card        : 7.13:1 (Min 4.5:1) -> PASS

Contrast audit passed: All theme combinations exceed 4.5:1 WCAG AA standard.
```

### C. Base Typography Check
- Computed base font-size: `18px` (>= 18px: `true`)

### D. 360px Mobile Viewport Overflow Check
- 360px viewport width: `360px`
- scrollWidth: `360px`
- Horizontal overflow: `false`

---

## 7. Automated Test Suite Results

### Vitest Unit & Conformance Suite (67/67 Tests Passed)
```
 ✓ tests/golden_types.test.ts (8 tests)
 ✓ tests/receipts.test.ts (10 tests)
 ✓ tests/validators.test.ts (44 tests)
 ✓ tests/contracts_and_errors.test.ts (2 tests)
 ✓ tests/scans.test.ts (3 tests)

 Test Files  5 passed (5)
      Tests  67 passed (67)
```

### Playwright End-to-End Suite (14/14 Tests Passed)
```
  ok  1 [chromium] › tests/e2e/app.test.ts:5:3 › Landing page renders promise, 3-step explainer, and Preview badge
  ok  2 [mobile] › tests/e2e/app.test.ts:5:3 › Landing page renders promise, 3-step explainer, and Preview badge
  ok  3 [chromium] › tests/e2e/app.test.ts:29:3 › Products page displays zero-wallet readable catalogue
  ok  4 [mobile] › tests/e2e/app.test.ts:29:3 › Products page displays zero-wallet readable catalogue
  ok  5 [chromium] › tests/e2e/app.test.ts:35:3 › Create product page enforces strict client-side validations
  ok  6 [mobile] › tests/e2e/app.test.ts:35:3 › Create product page enforces strict client-side validations
  ok  7 [chromium] › tests/e2e/app.test.ts:47:3 › Evidence page loads matrix, balance snapshots, and superseded table
  ok  8 [mobile] › tests/e2e/app.test.ts:47:3 › Evidence page loads matrix, balance snapshots, and superseded table
  ok  9 [chromium] › tests/e2e/app.test.ts:59:3 › Limits page displays contract operational bounds
  ok 10 [mobile] › tests/e2e/app.test.ts:59:3 › Limits page displays contract operational bounds
  ok 11 [chromium] › tests/e2e/app.test.ts:66:3 › CoverGuard page allows address query and gate inspection
  ok 12 [mobile] › tests/e2e/app.test.ts:66:3 › CoverGuard page allows address query and gate inspection
  ok 13 [chromium] › tests/e2e/app.test.ts:72:3 › Axe accessibility scan passes on Landing Page with 0 critical or serious violations
  ok 14 [mobile] › tests/e2e/app.test.ts:72:3 › Axe accessibility scan passes on Landing Page with 0 critical or serious violations

  14 passed
```

### Browser Visual & Accessibility Audit (8 Routes Audited)
```
======================================================
AUDIT SUMMARY
======================================================
Routes Audited:             8
Console Errors:             0
Axe Critical/Serious:       0
360px Overflow Violations:  0
Screenshots Captured:       32
Saved report:               docs/browser_audit.json

PASS: All browser checks clean!
```

---

## 8. Real On-Chain Full Lifecycle E2E Execution on Studionet

Executed via `scripts/e2e_full_chain.mjs` against deployed Cover V2 (`0x3d2698cED9292689f68b401e888fbA1d18CBfdE3`) and CoverGuard V2 (`0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A`).

### Summary
- Total On-Chain Write Attempts: 16
- Successful Writes: 16
- Failed Writes: 0

### Transaction Execution Matrix

| Step | Function | Caller Address | Tx Hash | Latency | Status | Leader Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1_claim_credits** | `claim_demo_credits` | `0x0F40D4569F45b16330bF4Be737604053b0522428` | `0xee0de579ee5dcbd801b911b573f8b8bb8901b1361c18a21725390edd122c946c` | 9.17s | ACCEPTED | SUCCESS |
| **2_create_product** | `create_product` | `0xD81f343599C5439748e32ec28128E8f9E2B1d8cF` | `0xf987c3c6119130d2d61b4de130e440c9740fc45fdeed8401c0226da30127bf21` | 8.82s | ACCEPTED | SUCCESS |
| **3_fund_product** | `fund_product` | `0xD81f343599C5439748e32ec28128E8f9E2B1d8cF` | `0xab1b88540d63656c3330be708f15d746a3266d77b5af5492d1cce2df5d8a646d` | 5.34s | ACCEPTED | SUCCESS |
| **5_buy_cover** | `buy` | `0x0F40D4569F45b16330bF4Be737604053b0522428` | `0x600f5596ab06e016690d9afe92610c392bbc275224c51f86535574c67d29c24f` | 25.36s | ACCEPTED | SUCCESS |
| **6a_update_source** | `update_source` | `0xD81f343599C5439748e32ec28128E8f9E2B1d8cF` | `0xfd4212816a3165358268f162dfd76c726f1ad663faca5a47e7d6ce33824f179f` | 8.60s | ACCEPTED | SUCCESS |
| **6_settle_policy** | `settle` | `0x0F40D4569F45b16330bF4Be737604053b0522428` | `0x56e621bb459a16030e5fd8dab8a543a1db3bdd67ba03ce0634cf49e5251bfda9` | 8.70s | ACCEPTED | SUCCESS |
| **7_restore_source** | `update_source` | `0xD81f343599C5439748e32ec28128E8f9E2B1d8cF` | `0xb7f5f3b17dc20550b1266c4999930522fea7342259c71c7ef970d61c9e8c31fa` | 5.29s | ACCEPTED | SUCCESS |
| **7a_buy_second** | `buy` | `0x0F40D4569F45b16330bF4Be737604053b0522428` | `0x616071bf099a315df1177eddd282ad99a48f215743fb37406480c91435367e4b` | 18.66s | ACCEPTED | SUCCESS |
| **7_cancel_policy** | `cancel` | `0x0F40D4569F45b16330bF4Be737604053b0522428` | `0x67a51b92263ed7a42ab672f688a400d9b4841a9a483dbd812e9e421e899a0679` | 5.34s | ACCEPTED | SUCCESS |
| **8_withdraw** | `withdraw_unreserved` | `0xD81f343599C5439748e32ec28128E8f9E2B1d8cF` | `0xa27cbc555bf64cc10ee981b33d04a324a2e916971d48c79d5ec4ab27fa27f462` | 5.29s | ACCEPTED | SUCCESS |
| **9a_buy_third** | `buy` | `0x0F40D4569F45b16330bF4Be737604053b0522428` | `0x79e37d0f6b69ce1e23a988025dacc4687e69e56375d7da585d155d8da04836fb` | 18.56s | ACCEPTED | SUCCESS |
| **9_coverguard** | `attest` | `0x0F40D4569F45b16330bF4Be737604053b0522428` | `0xec08176da36c0c5be7c039f0e64cdf037129333f343dba155ab303ac92ad3e7e` | 8.58s | ACCEPTED | SUCCESS |

### View Readback Validations
1. **Quote vs Charged**: Quoted 10 CR, formula ceiling 10 CR, charged 10 CR (exact match).
2. **Purchase-Time Pinned Binding**:
   - Product 5 created with `url`: `https://raw.githubusercontent.com/hypercybers99/cover-fixtures/92c69bc636517656b9e7ee031a503adfb2d26bb4/status-s0-operational.md`
   - Policy 8 purchased under s0Url, pinning `evidence_url = s0Url` and `terms_hash = 8368347393c32f3c9e6df4813844cbcfad194ebecba975144f6d05175912c8f1`.
   - Product 5 source updated to `status-s1-outage-75.md`.
   - Settle on Policy 8 fetched pinned `s0Url`, triggering `PAGE_UNCHANGED -> NO_PAY` (exact match with contract evidence S2).
3. **CoverGuard Integration (5-arg signature)**:
   - `is_covered_for(holder, policyId10, productId5, termsHash, 50)`: `true`
   - `is_covered_for(holder, policyId10, productId5, termsHash, 100)`: `false` (exceeds coverage)
   - `is_covered_for(holder, policyId10, productId5, wrongHash, 50)`: `false` (terms hash mismatch)
   - `list_attestations(holder)`: retrieved on-chain attestation record for Policy 10.

---

## 9. Deployed Audit on GitHub Pages

- Deployed Base URL: `https://hypercybers99.github.io/cover-app`
- GitHub Actions CI Run: `https://github.com/hypercybers99/cover-app/actions/runs/42219574860` (SUCCESS)
- GitHub Actions Deploy Run: `https://github.com/hypercybers99/cover-app/actions/runs/42219574987` (SUCCESS)

### Audit Verification Metrics
```
======================================================
DEPLOYED AUDIT SUMMARY
======================================================
Deployed URL:            https://hypercybers99.github.io/cover-app
Console Errors:          0
Axe Light Violations:    0
Axe Dark Violations:     0
360px Overflow:          false
Base Typography:         18px (Pass: true)
Zero-Wallet Chain Read:  PASS
3/3 Deep Links Passed:   true
Outputs Saved To:        docs/deployed_audit/
```

### SPA Deep Link Verification
1. `https://hypercybers99.github.io/cover-app/products/1` -> Rendered page: `true`, Expected text `Product #1`: `true`, Screenshot: `docs/deployed_audit/deeplink_products_1.png`
2. `https://hypercybers99.github.io/cover-app/policies/1` -> Rendered page: `true`, Expected text `Policy #1`: `true`, Screenshot: `docs/deployed_audit/deeplink_policies_1.png`
3. `https://hypercybers99.github.io/cover-app/guard` -> Rendered page: `true`, Expected text `CoverGuard`: `true`, Screenshot: `docs/deployed_audit/deeplink_guard.png`

---

## 10. Real Payout Path E2E Execution (Mutable Fixture & CoverGuard Gate Checks)

Executed as Step 10 of `scripts/e2e_full_chain.mjs` against deployed Cover V2 (`0x3d2698cED9292689f68b401e888fbA1d18CBfdE3`) and CoverGuard V2 (`0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A`) with evidence saved to `docs/e2e/step10_mutable_payout.json`.

### A. Mutable Lifecycle Transactions

| Action | Function | ID | Tx Hash | Latency | Status Name | Leader Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Create Product** | `create_product` | `12` | `0xc9c99ad2fe8ed2e3242f8405cf9f1f2a6bc34da78bd1fdb462516bcf8307ee21` | 5.30 s | `ACCEPTED` | `SUCCESS` |
| **Fund Product** | `fund_product` | `12` | `0xdf74173cf31387f2b8e8f6ce17073e470fe01ed9a584ae92ffe374124ddea4a5` | 5.34 s | `ACCEPTED` | `SUCCESS` |
| **Buy Policy** | `buy` | `16` | `0x9a20dc7e2f62ad82fb1cc334523504388f5850a3e90aa8ee2c2c8494b8c78730` | 24.58 s | `ACCEPTED` | `SUCCESS` |
| **Settle Policy** | `settle` | `16` | `0xa8affe068d8372ae65e569cb37dd38399bbc3157356617e70dd026c8145b5d58` | 16.31 s | `ACCEPTED` | `SUCCESS` |

### B. Fixture Mutation & Invalidation
- **Fixture Commit**: `e4cf48528b087138a118cacb0db4e142cf402afe` (Outage 75 min injected into `status-mutable-app.md`)
- **Pushed At**: `2026-11-06T13:26:37.493Z`
- **CDN Cache-Free Verified**: `2026-11-06T13:32:46.012Z` (368 s cooling)

### C. Settlement Outcome & Payout Validation
- **Settlement ID**: `10`
- **Settlement Outcome**: `PAY_100` (Incident duration: 75 minutes, threshold: 60 minutes)
- **Settlement Payout**: 100 demo credits
- **Policy Record**: Status transitioned from `ACTIVE` to `PAID`, `paid_amount` updated to 100 demo credits.
- **Buyer Balance**: Increased from 998 to 1,098 demo credits (+100 demo credits payout).

### D. CoverGuard Post-PAID Gate Checks
- `is_covered(0x2568e92ffba4f809a63348f63a5465f2151fc483, "16")`: returned `covered="false"`, `reason="PAID"`, `policy_status="PAID"`.
- `is_covered_for(0x2568e92ffba4f809a63348f63a5465f2151fc483, "16", "12", "7edc573ddc5ed64b4574a61ec963e0639422e92273098e2d1d415586d372e95f", 100)`: returned `false`.
