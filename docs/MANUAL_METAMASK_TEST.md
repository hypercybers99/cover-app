# Manual MetaMask End-to-End Verification Runbook

This runbook provides step-by-step instructions for the owner to manually verify the Cover web application using a real MetaMask browser extension on GenLayer Studionet.

> [!NOTE]
> In accordance with project build rules, any interactive steps requiring real browser extension popups are explicitly tagged **not run by the agent** (automated flows were verified programmatically via throwaway keys and Playwright).

---

## Network Configuration

Add the GenLayer Studionet network to MetaMask if not already configured:

| Property | Value |
| :--- | :--- |
| **Network Name** | GenLayer Studionet |
| **RPC URL** | `https://studio.genlayer.com/api` |
| **Chain ID** | `61999` (Hex: `0xf22f`) |
| **Currency Symbol** | `GEN` |
| **Block Explorer URL** | `https://explorer-studio.genlayer.com` |

---

## Active Deployed Contracts

| Contract | Address | Source SHA-256 |
| :--- | :--- | :--- |
| **Cover** | `0x4d12d00d527869a6a6f95358A11589ecf3C347e3` | `a1f8ceb89f55db9aa6fe55fb60f4783643212eb127e9c2f76b59266c921d89cc` |
| **CoverGuard** | `0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724` | `b2682e9e48b67a0ac95148b25d0e10694fad671359144d2b79368f8b921f7d53` |

---

## Step-by-Step Test Procedure

### 1. Zero-Wallet Initial Audit
- **Action**: Open `http://localhost:4173/` or the production URL in an incognito window without connecting MetaMask.
- **Expected Result**: All pages (`/products`, `/guard`, `/evidence`, `/limits`) load instantly. Invariant balances and 39-step execution history are fully readable.
- **Status**: Verified by agent (automated Playwright and axe tests).

### 2. Connect MetaMask
- **Action**: Click **Connect Wallet** in the top navigation header.
- **Expected Result**: MetaMask prompts to select an account and switch to Chain ID 61999. Upon approval, the header displays the shortened address and demo credits pill (`0 CR`).
- **Status**: **not run by the agent** (requires interactive MetaMask popup in browser extension).

### 3. Claim Demo Credits
- **Action**: Navigate to `/credits` and click **Claim 1,000 Demo Credits**.
- **Expected Result**: 
  - MetaMask prompts to confirm the zero-value transaction calling `claim_demo_credits()`.
  - The in-app transaction modal opens with a live running timer.
  - Upon consensus confirmation, modal displays **Transaction Succeeded** and balance increments from `0 CR` to `1,000 CR`.
- **Status**: **not run by the agent** via browser extension (verified programmatically via on-chain test script `scripts/e2e_studionet_check.ts`, tx `0x0b91309a69c1cfd7ee83af8edc99514ce10b5b46d4cb4ff7497a74dadaee8acf`).

### 4. Create Coverage Product (Underwriter Path)
- **Action**: Navigate to `/products/new`.
- **Inputs**:
  - Name: `CloudFlare Status Cover`
  - URL: `https://www.cloudflarestatus.com`
  - Rule: `Report 100% outage when Major Outage banner is present across all core edge points.`
  - 100% Threshold: `90`
  - 50% Threshold: `50`
  - 25% Threshold: `25`
  - Premium Rate: `500` (5.00% / yr)
  - Initial Deposit: `100` CR
- **Action**: Click **Deploy Coverage Pool** and approve transaction in MetaMask.
- **Expected Result**: TxStatusModal tracks validator consensus, and on success redirects to `/products`.
- **Status**: **not run by the agent** via browser extension (validated via Playwright form assertions and contract unit tests).

### 5. Fund Product Pool (Underwriter Liquidity)
- **Action**: Navigate to `/products/1`. Under **Pool Liquidity Controls**, enter `50` CR in **Add Liquidity** and click **Fund**.
- **Expected Result**: MetaMask prompts confirmation; pool balance increases by 50 CR.
- **Status**: **not run by the agent** via browser extension.

### 6. Purchase Parametric Cover (Buyer Path)
- **Action**: On `/products/1`, enter `100` CR desired coverage and `30` days duration.
- **Expected Result**: Quoted premium dynamically displays calculated cost. Click **Confirm & Purchase Policy** and approve in MetaMask. Policy appears in the product's active policies table.
- **Status**: **not run by the agent** via browser extension.

### 7. CoverGuard Integration Verification
- **Action**: Navigate to `/guard`. Enter your connected address or click **Use my connected address**. Click **Verify**.
- **Expected Result**:
  - Active Coverage badge displays green **COVERED**.
  - Minimum coverage threshold check passes.
  - Click **Attest on CoverGuard** and confirm transaction in MetaMask.
  - Attestation timestamp updates with on-chain confirmation.
- **Status**: **not run by the agent** via browser extension.

### 8. Policy Settlement or Cancellation
- **Action**: Navigate to `/policies/1`.
  - For claim evaluation: Click **Trigger Settlement** to execute consensus check against live web endpoint.
  - For voluntary termination: Click **Cancel Policy** to receive pro-rated unspent premium refund.
- **Expected Result**: TxStatusModal displays execution progress. When settled, `OutcomeStamp` (`PAY_100`, `PAY_50`, `PAY_25`, `NO_PAY`, or `REVIEW`) and `GateChip` (`JUDGED`, `TRIPWIRE`, or `PAGE_UNCHANGED`) render with detailed meanings.
- **Status**: **not run by the agent** via browser extension.

---

## Disclaimers

Credits are demo credits on GenLayer studionet, not money. Cover is an experimental preview application.
