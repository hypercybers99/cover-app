# Cover - Decentralized Parametric Web Service Protection

Cover is a decentralized parametric coverage protocol for web infrastructure and APIs powered by GenLayer intelligent contracts evaluated by multi-validator consensus.

**Status**: Preview | **Network**: GenLayer Studionet (Chain ID `61999`, RPC `https://studio.genlayer.com/api`)

> [!NOTE]
> Credits are demo credits on GenLayer studionet, not money. Cover is an experimental preview application.

---

## Active Deployed Contracts

| Contract | Address | Source SHA-256 | Deployed Transaction |
| :--- | :--- | :--- | :--- |
| **Cover** | `0x4d12d00d527869a6a6f95358A11589ecf3C347e3` | `a1f8ceb89f55db9aa6fe55fb60f4783643212eb127e9c2f76b59266c921d89cc` | `0x311652e1597eba4cb1d90581980c076c0ecb5708ab051756af3fbfa0db804b94` |
| **CoverGuard** | `0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724` | `b2682e9e48b67a0ac95148b25d0e10694fad671359144d2b79368f8b921f7d53` | `0xda046cfaaa78a30b40e226840e1032ee6b637307874b7704a92be72d44321b97` |

Superseded pair: Cover `0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd`, CoverGuard `0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF` (superseded)

Source of truth: Contract repository [`cover-genlayer`](https://github.com/hypercybers99/cover-genlayer) at tag `cover-v1-final` (commit `de8ca89`).

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
# 1. Run unit & static scan suites (50 tests)
npm test

# 2. Run static constraint scanners individually
node scripts/scan_banned.mjs
node scripts/scan_gradients.mjs
node scripts/scan_contrast.mjs

# 3. Run Playwright end-to-end tests (14 tests across desktop & mobile)
npx playwright test

# 4. Run automated browser visual & accessibility audit (32 screenshots)
node scripts/run_browser_checks.mjs

# 5. Run live studionet E2E validation with throwaway key
npx tsx scripts/e2e_studionet_check.ts
```

---

## Project Structure

```
cover-app/
├── contracts/                  # Reference contract source byte-for-byte copies
│   ├── Cover.py                # Active Cover intelligent contract (SHA-256 a1f8ceb8...)
│   └── CoverGuard.py           # Active CoverGuard contract (SHA-256 b2682e9e...)
├── docs/                       # Verification artifacts & audit reports
│   ├── screens/                # 32 viewport screenshots (light/dark, desktop/mobile)
│   ├── e2e/                    # On-chain test receipts
│   ├── browser_audit.json      # Automated console, axe, and overflow audit results
│   ├── MANUAL_METAMASK_TEST.md # Step-by-step manual testing runbook
│   └── FINAL_REPORT_APP.md     # Machine-verifiable completion report
├── scripts/                    # Build, sync, and verification tooling
│   ├── sync_deployments.mjs    # Syncs ADDRESS_REGISTRY.md and deployments.json
│   ├── sync_evidence.mjs       # Syncs live_evidence and robustness summaries
│   ├── verify_contracts.mjs    # Verifies deployed contract payloads vs source
│   ├── scan_banned.mjs         # Scans for forbidden words
│   ├── scan_gradients.mjs      # Verifies absence of gradient styles
│   ├── scan_contrast.mjs       # Asserts WCAG AA contrast ratios
│   └── run_browser_checks.mjs  # Automated Playwright visual and axe audit
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
│   │   ├── receipts.ts         # Consensus receipt classifier (SUCCESS, USER_ERROR, etc.)
│   │   └── validators.ts       # Strict client-side validation mirroring contract rules
│   ├── pages/                  # 10 Application pages
│   │   ├── LandingPage.tsx     # One-sentence promise, 3-step guide, system metrics
│   │   ├── ProductsPage.tsx    # Zero-wallet readable product index
│   │   ├── CreateProductPage.tsx # Underwriter pool deployment form
│   │   ├── ProductDetailPage.tsx # Purchase cover, quote premium, add/withdraw liquidity
│   │   ├── PolicyDetailPage.tsx  # Policy terms, settlement trigger, cancellation
│   │   ├── CreditsPage.tsx     # Demo credits faucet and accounting invariant
│   │   ├── CoverGuardPage.tsx  # CoverGuard query and attestation gateway
│   │   ├── EvidencePage.tsx    # Balance snapshot invariants & 39-step matrix
│   │   ├── LimitsPage.tsx      # Operational bounds read from contract views
│   │   └── NotFoundPage.tsx    # 404 error page
│   └── styles/
│       └── theme.css           # 18px base typography, natural palette variables
└── tests/                      # Automated test suites
    ├── contracts_and_errors.test.ts # Byte-for-byte SHA assertions & error coverage
    ├── receipts.test.ts        # 8-path consensus receipt classifier tests
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
| **Coverage Range** | 1 – 100,000 CR | Enforces 100% reserve backing for all issued policies |
| **Duration Range** | 1 – 365 Days | Bounds temporal risk exposure and prevents stale coverage |
| **Annual Premium Rate** | 100 – 5,000 bps (1.00% – 50.00%) | Protects underwriters while preventing predatory rates |
| **Product Name Length** | 3 – 60 ASCII characters | Readable UI display; bounds on-chain state footprint |
| **Source URL Length** | 1 – 300 ASCII characters (HTTPS) | Pure ASCII HTTPS URLs without user credentials or fragments |
| **Incident Rule Text** | 10 – 200 ASCII characters | Prevents prompt injection; ensures deterministic consensus voting |

---

## Error Remediation Reference

Every `gl.vm.UserError` raised by the contracts maps to a clear user explanation and suggested action in the UI:

| Contract Error Prefix | User Explanation | Suggested Remediation |
| :--- | :--- | :--- |
| `bad URL: scheme must be https` | The source URL does not use the secure HTTPS protocol. | Use an https:// URL; plain http:// is rejected by the contract. |
| `bad URL: IP literals not allowed` | The source URL uses a raw IPv4 or IPv6 numerical address. | Use a public DNS hostname instead of an IP literal. |
| `bad name` | Product name must be 3 to 60 ASCII characters. | Provide a standard ASCII product name between 3 and 60 characters. |
| `bad rule text` | Incident rule text must be between 10 and 200 characters. | Provide a concise incident rule description between 10 and 200 characters. |
| `bad thresholds` | Thresholds must be integer minutes where 100% threshold > 50% threshold >= 1. | Ensure 100% threshold is greater than 50% threshold. |
| `insufficient unreserved pool balance` | The pool does not have enough unreserved liquidity to back this coverage. | Choose a smaller coverage amount or wait for an underwriter to fund the pool. |
| `insufficient balance` | Your connected wallet does not hold enough demo credits for this deposit or premium. | Claim 1,000 demo credits from the faucet at `/credits`. |
| `not active` | The requested policy has already settled or was cancelled. | Choose an active policy. |
| `not expired` | Policy is still within its active temporal term and cannot be settled as expired. | Wait until the policy expiration timestamp or settle when an active outage occurs. |
| `not creator` | This management action is restricted to the original pool creator. | Switch to the creator wallet address in MetaMask. |

---

## License

MIT License. Open source research on GenLayer intelligent contracts.
