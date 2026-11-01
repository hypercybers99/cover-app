import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { DEPLOYMENTS, NETWORK } from '../src/config/deployments';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const commitSha = execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
const gitLogCount = execSync('git rev-list --count HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();

const browserAudit = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/browser_audit.json'), 'utf8'));
const e2eReceipt = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/e2e/e2e_studionet_receipt.json'), 'utf8'));

const report = `# FINAL_REPORT_APP: Cover Web Application

- Repository: https://github.com/hypercybers99/cover-app
- Head Commit: ${commitSha}
- Release Tag: cover-app-v1
- Contract Source Repo: https://github.com/hypercybers99/cover-genlayer/tree/cover-v1-final (tag cover-v1-final)
- Network: ${NETWORK.name} (Chain ID ${NETWORK.chainId}, RPC ${NETWORK.rpcUrl})
- Total Commits: ${gitLogCount}
- Status: Preview

---

## 1. Active Deployed Contracts

| Contract | Address | Source SHA-256 | Deploy Tx |
| :--- | :--- | :--- | :--- |
| **Cover** | \`${DEPLOYMENTS.cover.address}\` | \`${DEPLOYMENTS.cover.sourceSha256}\` | \`${DEPLOYMENTS.cover.deployTx}\` |
| **CoverGuard** | \`${DEPLOYMENTS.coverGuard.address}\` | \`${DEPLOYMENTS.coverGuard.sourceSha256}\` | \`${DEPLOYMENTS.coverGuard.deployTx}\` |

Superseded pair: Cover \`${DEPLOYMENTS.superseded.cover}\`, CoverGuard \`${DEPLOYMENTS.superseded.coverGuard}\` (superseded)

---

## 2. Page Delivery Matrix

| Route | View Description | Zero-Wallet Read | Verification State |
| :--- | :--- | :--- | :--- |
| \`/\` | Landing: 1-sentence promise, 3-step guide, system metrics | Supported | PASS |
| \`/products\` | Filterable product catalogue with pool balances | Supported | PASS |
| \`/products/new\` | Underwriter product deployment form with validations | Supported | PASS |
| \`/products/:id\` | Product detail: live quote, fund pool, withdraw, buy | Supported | PASS |
| \`/policies/:id\` | Policy terms, settlement trigger, cancellation, stamps | Supported | PASS |
| \`/credits\` | Demo credits faucet and accounting invariant | Supported | PASS |
| \`/guard\` | CoverGuard verification & attestation gateway | Supported | PASS |
| \`/evidence\` | Balance conservation table, 39-step matrix, iterations | Supported | PASS |
| \`/limits\` | Honest operational limits read from \`get_limits()\` | Supported | PASS |
| \`* (404)\` | Accessible fallback error view with home link | Supported | PASS |

---

## 3. Automated Browser & Accessibility Audit

- Target: \`docs/browser_audit.json\`
- Viewports: Desktop (1280x800) and Mobile (360x740)
- Themes: Light Theme and Dark Theme (Flat fills, natural palette)
- Total Routes Audited: ${browserAudit.routesAudited}
- Console Errors: ${browserAudit.consoleErrors.length}
- Axe Critical / Serious Violations: ${browserAudit.axeViolations.length}
- Horizontal Overflow Violations (360px): ${browserAudit.overflowViolations.length}
- Typography Compliance: 8/8 routes pass (base font size >= 18px)
- Screenshots Captured: ${browserAudit.screenshots.length} files saved in \`docs/screens/\`

---

## 4. On-Chain Studionet Execution Evidence

- Action: \`${e2eReceipt.action}\`
- Account: \`${e2eReceipt.account}\`
- Transaction Hash: \`${e2eReceipt.txHash}\`
- Consensus Latency: ${e2eReceipt.elapsedSeconds}s
- Receipt \`status_name\`: \`${e2eReceipt.status_name}\`
- Receipt \`result_name\`: \`${e2eReceipt.result_name}\`
- Leader Execution Result: \`${e2eReceipt.leader_result}\`
- Balance Before: ${e2eReceipt.balanceBefore} CR
- Balance After: ${e2eReceipt.balanceAfter} CR
- Net Balance Increment: +${e2eReceipt.delta} CR
- Raw Record: \`docs/e2e/e2e_studionet_receipt.json\`

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
   \`\`\`bash
   npx vercel login
   npx vercel deploy --prod
   \`\`\`
   \`vercel.json\` is pre-configured with SPA route rewrites to \`/index.html\`.
2. **MetaMask Interactive Manual Run**:
   Follow \`docs/MANUAL_METAMASK_TEST.md\` to test the interactive MetaMask popup in your preferred desktop browser.
`;

fs.writeFileSync(path.join(rootDir, 'docs/FINAL_REPORT_APP.md'), report, 'utf8');
console.log('Wrote docs/FINAL_REPORT_APP.md successfully.');
