# FINAL_REPORT_APP: Cover Web Application

- Repository: https://github.com/hypercybers99/cover-app
- Release Tag: cover-app-v1
- Contract Source Repo: https://github.com/hypercybers99/cover-genlayer/tree/cover-v1-final (tag cover-v1-final)
- Network: GenLayer Studionet (Chain ID 61999, RPC https://studio.genlayer.com/api)
- Total Commits: 14
- Status: Preview

---

## 1. Active Deployed Contracts

| Contract | Address | Source SHA-256 | Deploy Tx |
| :--- | :--- | :--- | :--- |
| **Cover** | `0x4d12d00d527869a6a6f95358A11589ecf3C347e3` | `a1f8ceb89f55db9aa6fe55fb60f4783643212eb127e9c2f76b59266c921d89cc` | `0x311652e1597eba4cb1d90581980c076c0ecb5708ab051756af3fbfa0db804b94` |
| **CoverGuard** | `0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724` | `b2682e9e48b67a0ac95148b25d0e10694fad671359144d2b79368f8b921f7d53` | `0xda046cfaaa78a30b40e226840e1032ee6b637307874b7704a92be72d44321b97` |

Superseded pair: Cover `0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd`, CoverGuard `0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF` (superseded)

---

## 2. Page Delivery Matrix

| Route | View Description | Zero-Wallet Read | Verification State |
| :--- | :--- | :--- | :--- |
| `/` | Landing: 1-sentence promise, 3-step guide, system metrics | Supported | PASS |
| `/products` | Filterable product catalogue with pool balances | Supported | PASS |
| `/products/new` | Underwriter product deployment form with validations | Supported | PASS |
| `/products/:id` | Product detail: live quote, fund pool, withdraw, buy | Supported | PASS |
| `/policies/:id` | Policy terms, settlement trigger, cancellation, stamps | Supported | PASS |
| `/credits` | Demo credits faucet and accounting invariant | Supported | PASS |
| `/guard` | CoverGuard verification & attestation gateway | Supported | PASS |
| `/evidence` | Balance conservation table, 39-step matrix, iterations | Supported | PASS |
| `/limits` | Honest operational limits read from `get_limits()` | Supported | PASS |
| `* (404)` | Accessible fallback error view with home link | Supported | PASS |

---

## 3. Automated Browser & Accessibility Audit

- Target: `docs/browser_audit.json`
- Viewports: Desktop (1280x800) and Mobile (360x740)
- Themes: Light Theme and Dark Theme (Flat fills, natural palette)
- Total Routes Audited: 8
- Console Errors: 0
- Axe Critical / Serious Violations: 0
- Horizontal Overflow Violations (360px): 0
- Typography Compliance: 8/8 routes pass (base font size >= 18px)
- Screenshots Captured: 32 files saved in `docs/screens/`

---

## 4. On-Chain Studionet Execution Evidence

- Action: `claim_demo_credits`
- Account: `0x436A2b9D61ADB1a850B66990036Cf66fF4845319`
- Transaction Hash: `0x0b91309a69c1cfd7ee83af8edc99514ce10b5b46d4cb4ff7497a74dadaee8acf`
- Consensus Latency: 6s
- Receipt `status_name`: `ACCEPTED`
- Receipt `result_name`: `MAJORITY_AGREE`
- Leader Execution Result: `SUCCESS`
- Balance Before: 0 CR
- Balance After: 1000 CR
- Net Balance Increment: +1000 CR
- Raw Record: `docs/e2e/e2e_studionet_receipt.json`

---

## 5. Test Suite Results

- **Unit & Scanner Suite (Vitest)**: 50/50 passed
  - Receipts classification (8 combinations): PASS
  - Client-side validators (37 test cases): PASS
  - Contract source hashes & UserError mapping (54 raise statements, 100% covered): PASS
  - Static scanner: 0 banned words, 0 gradients/blurs, WCAG AA contrast (14.46:1 light, 15.59:1 dark): PASS
- **End-to-End Suite (Playwright)**: 14/14 passed
  - Desktop Chrome: 7/7 passed
  - Mobile (360x740): 7/7 passed
- **Visual & Accessibility Suite**: 8/8 routes passed

---

## 6. Needed from the Owner

1. **Vercel Production Deployment**:
   Since the build ran in an automated sandbox without pre-authenticated credentials, run the following in the repository directory to deploy:
   ```bash
   npx vercel login
   npx vercel deploy --prod
   ```
   `vercel.json` is pre-configured with SPA route rewrites to `/index.html`.
2. **MetaMask Interactive Manual Run**:
   Follow `docs/MANUAL_METAMASK_TEST.md` to test the interactive MetaMask popup in your preferred desktop browser.
