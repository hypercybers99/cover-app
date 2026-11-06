# Cover - web app (Preview)

Parametric web-service cover on GenLayer studionet (demo credits).

- **Contract and Evidence Repository**: [https://github.com/hypercybers99/cover-genlayer](https://github.com/hypercybers99/cover-genlayer/tree/cover-v2) (tag `cover-v2`)
- **Deployed App URL**: [https://hypercybers99.github.io/cover-app/](https://hypercybers99.github.io/cover-app/)
- **Cover V2 Contract Explorer**: [0x3d2698cED9292689f68b401e888fbA1d18CBfdE3](https://explorer-studio.genlayer.com/address/0x3d2698cED9292689f68b401e888fbA1d18CBfdE3)
- **CoverGuard V2 Contract Explorer**: [0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A](https://explorer-studio.genlayer.com/address/0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A)

> [!NOTE]
> Credits are demo credits on GenLayer studionet, not money. Cover is an experimental preview application.

---

## Active Deployed Contracts (V2)

| Contract | Address | Source SHA-256 | Deployed Transaction |
| :--- | :--- | :--- | :--- |
| **Cover V2** | `0x3d2698cED9292689f68b401e888fbA1d18CBfdE3` | `0b2f91d2b64dee1dce4aa13c15c19c274546dd64fff8b738325067c37a12b296` | `0x3f4ef296da9e609ba83dc5ed5c866910e26fd7eb9055273142683618b5e8a8a8` |
| **CoverGuard V2** | `0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A` | `e0546c62266e7ab13b0aaa70489ada2625849742f004cb21732aaef03cd901a1` | `0xdecd58ff74a091ed5b1e7ddb8f188402d1e06ebf92517147cb92199e14fd0b3e` |

### Superseded Deployments

| Version | Cover Address | CoverGuard Address | Status |
| :--- | :--- | :--- | :--- |
| **V1** | `0x4d12d00d527869a6a6f95358A11589ecf3C347e3` | `0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724` | Superseded, kept for history |
| **V0** | `0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd` | `0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF` | Superseded, kept for history |

Source of truth: Contract repository [`cover-genlayer`](https://github.com/hypercybers99/cover-genlayer) at tag `cover-v2` (commit `f641d80`).

---

## Visual Design & Architecture Principles

- **Natural Palette**: Warm off-white (`#F7F5F0`), ink-dark (`#1F2421`), forest green (`#2F5D46`), sand (`#EDE8DC`), clay (`#8F3818`), sage (`#DCE8DD`), brick (`#9C2F2F`).
- **Strictly Flat Styling**: Flat fills only. Gradients, glassmorphism, and backdrop blurs are completely forbidden across the entire styling system.
- **Accessibility & Touch Targets**: WCAG AA contrast ratio >= 4.5:1 across light and dark modes (measured up to 15.59:1). Base font size >= 18px. Minimum interactive target height >= 44px (buttons and inputs >= 48px).
- **Zero-Wallet Read**: Full product catalogue, pool health, limits, transaction matrices, and balance snapshots are accessible without connecting a wallet.

---

## Getting Started

### Prerequisites
- Node.js >= 20
- npm >= 9

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/hypercybers99/cover-app.git
cd cover-app

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build & Preview

```bash
# Typecheck and create production bundle
npm run build

# Preview production build locally on port 4173
npm run preview
```

---

## Running Automated Tests

Cover includes comprehensive test suites across static analysis, contract verification, client validators, receipt parsing, browser accessibility, and end-to-end user flows.

```bash
# 1. Run unit & static scan suites (67 tests)
npm test

# 2. Run static constraint scanners individually
node scripts/scan_banned.mjs
node scripts/scan_gradients.mjs
node scripts/scan_contrast.mjs

# 3. Run Playwright end-to-end tests (14 tests across desktop & mobile)
npx playwright test

# 4. Run automated browser visual & accessibility audit (32 screenshots)
node scripts/run_browser_checks.mjs

# 5. Run Studionet on-chain full lifecycle E2E execution with throwaway keys
npx tsx scripts/e2e_full_chain.mjs

# 6. Run deployed audit on GitHub Pages URL
node scripts/audit_deployed.mjs
```

---

## Project Structure

```
cover-app/
├── contracts/                  # Reference contract source byte-for-byte copies
│   ├── Cover.py                # Active Cover V2 intelligent contract (SHA-256 0b2f91d2...)
│   └── CoverGuard.py           # Active CoverGuard V2 contract (SHA-256 e0546c62...)
├── docs/                       # Verification artifacts & audit reports
│   ├── screens/                # 32 viewport screenshots (light/dark, desktop/mobile)
│   ├── e2e/                    # On-chain test receipts (12/12 successful writes on Studionet)
│   ├── deployed_audit/         # GitHub Pages deployed audit outputs (deep links, axe, 360px)
│   ├── browser_audit.json      # Automated console, axe, and overflow audit results
│   └── FINAL_REPORT_APP.md     # Machine-verifiable completion report
├── scripts/                    # Build, sync, and verification tooling
│   ├── sync_deployments.mjs    # Syncs deployments.ts with contract evidence
│   ├── sync_evidence.mjs       # Syncs live_evidence and balance invariant snapshots
│   ├── verify_contracts.mjs    # Verifies deployed contract payloads vs source
│   ├── scan_banned.mjs         # Scans for forbidden words
│   ├── scan_gradients.mjs      # Verifies absence of gradient styles
│   ├── scan_contrast.mjs       # Asserts WCAG AA contrast ratios
│   ├── run_browser_checks.mjs  # Automated Playwright visual and axe audit
│   ├── audit_deployed.mjs      # Automated headless audit against deployed GitHub Pages URL
│   └── e2e_full_chain.mjs      # Full on-chain lifecycle E2E execution on Studionet
├── src/
│   ├── components/             # Accessible, flat UI components
│   │   ├── Header.tsx          # Navigation, theme toggle, wallet button, demo pill
│   │   ├── Footer.tsx          # Deployed contract links, explorer urls, disclaimers
│   │   ├── OutcomeStamp.tsx    # Payout outcome indicators (PAY_100, NO_PAY, etc.)
│   │   ├── GateChip.tsx        # Gate indicators (JUDGED, TRIPWIRE, PAGE_UNCHANGED)
│   │   ├── TxStatusModal.tsx   # Consensus timer modal with error decoding
│   │   └── DemoCreditNotice.tsx# Universal demo credit disclaimers
│   ├── config/
│   │   └── deployments.ts      # Active contract addresses, RPC, and explorer config
│   ├── context/
│   │   ├── ThemeContext.tsx    # Light and dark natural color palette provider
│   │   └── WalletContext.tsx   # MetaMask browser wallet & transaction management
│   ├── data/                   # Synced evidence summaries and matrix records
│   ├── lib/
│   │   ├── errors.ts           # 100% UserError mapping and remediation instructions
│   │   ├── receipts.ts         # Consensus receipt classifier & return value extractor
│   │   └── validators.ts       # Strict client-side validation mirroring contract rules
│   ├── pages/                  # Application pages
│   │   ├── LandingPage.tsx     # One-sentence promise, 3-step guide, system metrics
│   │   ├── ProductsPage.tsx    # Zero-wallet readable product index
│   │   ├── CreateProductPage.tsx # Underwriter pool deployment form with deterministic rule preview
│   │   ├── ProductDetailPage.tsx # Purchase cover, quote premium, add/withdraw liquidity, source history
│   │   ├── PolicyDetailPage.tsx  # Policy terms, settlement trigger, cancellation, locked source
│   │   ├── CreditsPage.tsx     # Demo credits faucet and accounting invariant
│   │   ├── CoverGuardPage.tsx  # 5-arg CoverGuard verification and attestation gateway
│   │   ├── EvidencePage.tsx    # Balance snapshot invariants & 27-step V2 on-chain matrix
│   │   ├── LimitsPage.tsx      # Operational bounds read from contract views
│   │   └── NotFoundPage.tsx    # 404 error page
│   └── styles/
│       └── theme.css           # 18px base typography, natural palette variables
└── tests/                      # Automated test suites
    ├── contracts_and_errors.test.ts # Byte-for-byte SHA assertions & error coverage
    ├── golden_types.test.ts    # Conformance tests against deployed contract JSON outputs
    ├── receipts.test.ts        # Consensus receipt classifier & product ID extraction tests
    ├── scans.test.ts           # Static analysis for banned words and flat fills
    ├── validators.test.ts      # Client-side input validation suite
    └── e2e/
        └── app.test.ts         # Playwright navigation, accessibility, and form tests
```

---

## Operational Limits (from `get_limits()`)

| Parameter | Boundary | Rationale |
| :--- | :--- | :--- |
| **Deposit Range** | 1 – 1,000,000 CR | Guarantees solvent pool liquidity without numerical overflow |
| **Coverage Range** | 10 – 100,000 CR | Enforces reserve backing for all issued policies |
| **Premium Rate Range** | 100 – 5,000 bps (1.00% – 50.00%) | Protects underwriters while preventing predatory rates |
| **Product Name Length** | 3 – 60 ASCII characters | Readable UI display; bounds on-chain state footprint |
| **Source URL Length** | 1 – 300 ASCII characters (HTTPS) | Pure ASCII HTTPS URLs without user credentials or fragments |
| **Max Page Size** | 400,000 bytes | Protects validators against oversized payload downloads |
| **Min Text Length** | 200 characters | Prevents unreadable or empty status page evaluation |

---

## Error Remediation Reference

Every `gl.vm.UserError` raised by the contracts (52 raise statements: 50 in `Cover.py` across 29 unique templates, 2 in `CoverGuard.py`) maps to a clear user explanation and suggested action in the UI:

| Contract Error String / Prefix | Contract | User-Facing Explanation | Suggested Remediation |
| :--- | :--- | :--- | :--- |
| `already claimed demo credits` | Cover | This wallet has already claimed its one-time allotment of 1,000 demo credits. | Use existing demo credits in this wallet, or switch to a new wallet address. |
| `bad amount` | Cover | The specified credit amount is invalid (must be a positive integer within bounds). | Enter an integer greater than zero within allowed product bounds. |
| `bad name` | Cover | The product name must be pure ASCII between 3 and 60 characters. | Enter a descriptive ASCII product name between 3 and 60 characters. |
| `bad premium rate` | Cover | The premium rate must be between 100 bps (1%) and 5,000 bps (50%). | Set a premium rate between 100 bps (1%) and 5,000 bps (50%). |
| `bad thresholds` | Cover | Outage thresholds are invalid: min_full must be 2-10080 min, and min_half must be 1 to (min_full - 1). | Adjust thresholds so min_half is strictly less than min_full. |
| `bad URL: fragment not allowed` | Cover | The source URL contains a hash fragment identifier (#section). | Remove the # anchor fragment from the URL. |
| `bad URL: IP literals not allowed` | Cover | The source URL uses a raw IPv4 or IPv6 numerical address. | Use a public DNS hostname instead of an IP literal. |
| `bad URL: length must be between 1 and 300 characters` | Cover | The provided source URL is either empty or longer than 300 characters. | Shorten the URL or use a direct HTTPS endpoint under 300 characters. |
| `bad URL: missing host` | Cover | The source URL has no hostname or domain specified. | Specify a fully qualified domain name (e.g. status.company.com). |
| `bad URL: must be pure ASCII` | Cover | The source URL contains international, Unicode, or non-ASCII characters. | Convert any non-ASCII domain characters to Punycode or standard ASCII. |
| `bad URL: port must be 443 or omitted` | Cover | The source URL specifies a custom port number other than 443. | Omit the port number or specify standard port 443. |
| `bad URL: scheme must be https` | Cover | The source URL does not use the secure HTTPS protocol. | Use an https:// URL; plain http:// is rejected by the contract. |
| `bad URL: userinfo not allowed` | Cover | The source URL contains embedded credentials (e.g., user:pass@host). | Remove user credentials from the URL. |
| `duplicate observation: {id}` | Cover | This policy was already settled against identical page content in a prior observation. | Wait until the status page updates with new incident information before settling again. |
| `event already in progress or status unclear at purchase` | Cover | Purchase refused: the target service is currently reporting an outage or degraded performance. | Cover can only be purchased while the monitored service is fully OPERATIONAL. |
| `host or directory mismatch on update_source` | Cover | The updated source URL must share the exact same host and directory path as the original product terms. | Keep the exact domain and folder path identical; only filename or query updates are permitted. |
| `HTTP status not 200: {code}` | Cover | The status page web server returned an HTTP error code instead of HTTP 200 OK. | Ensure the target page URL exists and is publicly accessible without authentication. |
| `insufficient balance` | Cover | Your wallet balance has fewer demo credits than the requested operation requires. | Claim demo credits on the Credits page or reduce the amount. |
| `not creator` | Cover | Only the underwriter address that created this product can withdraw or update its source. | Switch wallet to the product creator account. |
| `not holder` | Cover | Only the policy holder address can cancel this policy. | Connect the wallet that purchased the policy. |
| `page too large` | Cover | The status page content exceeded the maximum contract size limit of 400,000 bytes. | Point to a lightweight status page or markdown feed under 400 KB. |
| `page unreadable` | Cover | Cleaned text extracted from the status page was under 200 characters, indicating incomplete content or client-side rendering. | Ensure the page returns static HTML or markdown without client-side JavaScript rendering. |
| `policy not active` | Cover | This policy cannot be settled or cancelled because it is no longer ACTIVE (already PAID or CANCELLED). | View the settlement record or purchase a new policy. |
| `pool cannot cover this coverage` | Cover | The product pool lacks sufficient free capital to cover this policy at this time. | Request the underwriter fund more credits, or purchase a smaller coverage amount. |
| `source unreachable` | Cover | Validators could not fetch the status page URL (DNS, connection, or timeout failure). | Verify the public status page is reachable and try again. |
| `unknown policy` | Cover | The specified policy ID does not exist on-chain. | Check the policy ID in your active policies list. |
| `unknown product` | Cover | The specified product ID does not exist in the contract registry. | Verify the product ID or browse active products from the directory. |
| `unknown settlement` | Cover | The specified settlement observation ID does not exist. | Verify the settlement ID on the policy page. |
| `withdraw exceeds unreserved` | Cover | The requested withdrawal exceeds free unreserved credits in the product pool. | Check pool health and withdraw an amount less than or equal to unreserved pool balance. |
| `not covered: {reason}` | CoverGuard | CoverGuard verification failed: policy is not actively covered (e.g. PAID, CANCELLED, POOL_SHORT). | Check policy status, holder address, and product pool balance. |
| `unknown attestation` | CoverGuard | The specified attestation ID does not exist in CoverGuard. | Verify the attestation ID on the CoverGuard inspector page. |

---

## License

MIT License. Open source research on GenLayer intelligent contracts.
