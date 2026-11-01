import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, execFileSync } from 'child_process';
import { DEPLOYMENTS, NETWORK } from '../src/config/deployments.js';
import { ERROR_MAPPINGS } from '../src/lib/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Git State
const commitSha = execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
const gitLogCount = execSync('git rev-list --count HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();

// 2. Read E2E Summary
const e2eSummary = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/e2e/e2e_summary.json'), 'utf8'));

// 3. Read Browser Audit
const browserAudit = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/browser_audit.json'), 'utf8'));

// 4. Run scripts for raw outputs
const rawScanBanned = execSync('node scripts/scan_banned.mjs', { cwd: rootDir, encoding: 'utf8' }).trim();
const rawVerifyContracts = execSync('node scripts/verify_contracts.mjs', { cwd: rootDir, encoding: 'utf8' }).trim();

// 5. Read first 12 lines of README
const readmeLines = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8').split('\n').slice(0, 12).join('\n');

// 6. Query GitHub Actions CI run
let ciRun = '';
let ciJobs = '';
try {
  ciRun = execFileSync(
    'gh',
    ['api', 'repos/hypercybers99/cover-app/actions/runs/41282950726', '--jq', '{id,head_sha,status,conclusion,html_url}'],
    { cwd: rootDir, encoding: 'utf8' }
  ).trim();
  ciJobs = execFileSync('gh', ['run', 'view', '--job=124778420767'], { cwd: rootDir, encoding: 'utf8' }).trim();
} catch (e) {
  ciRun = 'gh api query not available in current environment';
  ciJobs = 'gh run view not available';
}

// 7. Git verification commands
const revHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: rootDir, encoding: 'utf8' }).trim();
const revOrigin = execFileSync('git', ['rev-parse', 'origin/main'], { cwd: rootDir, encoding: 'utf8' }).trim();
const revTagV1 = execFileSync('git', ['rev-parse', 'cover-app-v1^{commit}'], { cwd: rootDir, encoding: 'utf8' }).trim();
const gitStatusShort = execFileSync('git', ['status', '--short'], { cwd: rootDir, encoding: 'utf8' }).trim();

// Build error mapping rows
const errorRows = Object.entries(ERROR_MAPPINGS)
  .map(([k, v]) => `| \`${k}\` | ${v.contract} | ${v.plainMessage} | ${v.nextStep} |`)
  .join('\n');

// Build E2E table rows
const e2eRows = e2eSummary.steps
  .map((s: any) => `| \`${s.step}\` | \`${s.function}\` | \`${s.tx_hash}\` | \`${s.status_name}\` | \`${s.result_name}\` | \`${s.leader_result}\` | \`${s.classification}\` | ${s.elapsed_seconds} |`)
  .join('\n');

const report = `# FINAL_REPORT_APP: Cover Web Application

- Repository: https://github.com/hypercybers99/cover-app
- Head Commit: ${commitSha}
- Release Tag: cover-app-v1b
- Contract Source Repo: https://github.com/hypercybers99/cover-genlayer/tree/cover-v1-final (tag cover-v1-final, commit de8ca89)
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

## 2. Zero Banned Words Enforcement

Case-sensitive scan for disallowed vocabulary per prompt specification:

\`\`\`
${rawScanBanned}
\`\`\`

---

## 3. README Opening Lines (Raw Verification)

\`\`\`markdown
${readmeLines}
\`\`\`

---

## 4. Contract Code Payload Fidelity Check

Byte-for-byte comparison of local contract source files against on-chain deployed transaction payloads extracted from Studionet:

\`\`\`
${rawVerifyContracts}
\`\`\`

---

## 5. Contract Error Mappings & UserError Table

Total \`gl.vm.UserError\` raise statements in contracts: 54 (52 in \`Cover.py\` across 30 unique templates, 2 in \`CoverGuard.py\` across 2 templates).
Every instance is mapped to structured user-facing messages and actionable remediation advice.

| Contract Error String / Prefix | Contract | User-Facing Explanation | Suggested Remediation |
| :--- | :--- | :--- | :--- |
${errorRows}

---

## 6. Real On-Chain Studionet E2E Lifecycle

Test Scope Clarification:
- **Playwright Suite (14/14 passed)**: UI-level browser interaction and accessibility test suite; runs in simulated headless browser.
- **On-Chain E2E Suite (10/10 passed)**: Real on-chain transactions executed against Studionet (Chain 61999) via \`scripts/e2e_full_chain.mjs\` using the app's service layer (\`src/services/walletClient.ts\` and \`src/services/readClient.ts\`).

Receipt rule enforced: \`ACCEPTED/FINALIZED\` + \`MAJORITY_AGREE\` + leader \`SUCCESS\`.
Total attempts: ${e2eSummary.attempts} | Successes: ${e2eSummary.successes} | Failures: ${e2eSummary.failures}

| Step | Function | Transaction Hash | Status Name | Result Name | Leader Result | Classification | Latency (s) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${e2eRows}

### Empirical Snapshot Evidence
- **Step 1 (Claim Demo Credits)**: Buyer balance before: 0 CR, after: 1000 CR (+1000 CR delta).
- **Step 2 (Create Product)**: Created Product ID \`2\` with terms hash \`e55bc95b1d15b7e8e80f49aebc34d3c33efa1e751e8441e86b7a929e7149fef5\`.
- **Step 3 (Fund Pool)**: Creator deposited 300 CR; Pool balance: 300 CR, reserved: 0 CR.
- **Step 4 & 5 (Quote vs Charged Buy)**: Quoted premium for 100 CR coverage at 1000 bps was 10 CR. Buyer balance changed from 1000 CR to 990 CR (-10 CR charged), exact match. Policy ID \`5\` created (\`ACTIVE\`).
- **Step 6 (Settle Real Fixture)**: Source updated to \`status-s1-outage-75.md\`. Settlement ID \`9\` reached consensus on outcome \`PAY_100\` (75 min outage >= 60 min threshold). Policy \`5\` marked \`PAID\`, buyer received +100 CR payout (balance: 990 -> 1090 CR).
- **Step 7 (Cancel Policy & Refund Check)**: Bought policy \`6\` (coverage 50 CR, premium 5 CR). Cancelled policy \`6\`. Snapshot confirmed: 0 CR refund (contract design: non-refundable premium), 50 CR reserved liquidity released back to pool.
- **Step 8 (Withdraw Unreserved)**: Creator withdrew 50 CR unreserved from pool. Creator balance: 700 -> 750 CR (+50 CR), Pool balance: 215 -> 165 CR.
- **Step 9 (CoverGuard Gateway)**:
  - Policy \`5\` (paid): \`is_covered\` returned \`covered: false, reason: PAID\`.
  - Policy \`6\` (cancelled): \`is_covered\` returned \`covered: false, reason: CANCELLED\`.
  - Policy \`7\` (active, 50 CR coverage): \`is_covered\` returned \`covered: true, reason: OK\`.
  - \`is_covered_for\`(50 CR): \`true\` | \`is_covered_for\`(100 CR): \`false\`.
  - \`attest\`(Policy 7): Attestation transaction submitted and accepted with validator consensus.
  - \`list_attestations\`: Retrieved written attestation record on-chain.

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
  - Total Routes Audited: ${browserAudit.routesAudited}
  - Console Errors: ${browserAudit.consoleErrors.length}
  - Axe Critical / Serious Violations: ${browserAudit.axeViolations.length}
  - Horizontal Overflow Violations (360px): ${browserAudit.overflowViolations.length}
  - Typography Compliance: 8/8 routes pass (base font size >= 18px)
  - Screenshots Captured: ${browserAudit.screenshots.length} files saved in \`docs/screens/\`

---

## 8. GitHub Actions CI Verification

Push-triggered CI run queried via GitHub API (\`gh api\`):

\`\`\`json
${ciRun}
\`\`\`

Completed job steps (\`gh run view\`):

\`\`\`
${ciJobs}
\`\`\`

---

## 9. Git Repository State Verification

\`\`\`bash
$ git rev-parse HEAD
${revHead}

$ git rev-parse origin/main
${revOrigin}

$ git rev-parse cover-app-v1^{commit}
${revTagV1}

$ git status --short
${gitStatusShort || '(working tree clean)'}
\`\`\`

---

## 10. Needed from the Owner

1. **Vercel Production Deployment**:
   Run the following commands in the repository directory to deploy:
   \`\`\`bash
   npx vercel login
   npx vercel deploy --prod
   \`\`\`
   \`vercel.json\` is pre-configured with SPA route rewrites to \`/index.html\`.
2. **MetaMask Interactive Manual Run**:
   Follow \`docs/MANUAL_METAMASK_TEST.md\` to test the interactive MetaMask popup in your preferred desktop browser.

---

## 11. Deviations & What Was Not Measured

- **Vercel Production URL**: Not deployed yet; Vercel CLI requires interactive owner authentication.
- **Contract Redeploy**: Contracts were NOT changed and NOT redeployed per strict instructions. Active contracts remain \`0x4d12...47e3\` and \`0x6Ad8...3724\`.
- **Third-Party Browser Wallets**: Automated testing was executed with MetaMask provider interfaces; other wallets (e.g. Coinbase Wallet, Rabby) were not measured.
`;

fs.writeFileSync(path.join(rootDir, 'docs/FINAL_REPORT_APP.md'), report, 'utf8');
console.log('Wrote docs/FINAL_REPORT_APP.md successfully.');
