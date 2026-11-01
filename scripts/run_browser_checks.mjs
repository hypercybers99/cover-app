import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const ROUTES = [
  { path: '/', name: 'landing' },
  { path: '/products', name: 'products' },
  { path: '/products/new', name: 'products-new' },
  { path: '/guard', name: 'coverguard' },
  { path: '/credits', name: 'credits' },
  { path: '/evidence', name: 'evidence' },
  { path: '/limits', name: 'limits' },
  { path: '/not-found', name: 'not-found' },
];

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

async function runAudit() {
  console.log('======================================================');
  console.log('BROWSER AUDIT & SCREENSHOT SUITE');
  console.log('======================================================');

  // 1. Build project
  console.log('Building production bundle...');
  const { execSync } = await import('child_process');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  // 2. Start preview server
  console.log(`Starting preview server on port ${PORT}...`);
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], {
    cwd: rootDir,
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(`[preview] ${d}`));
  server.stderr.on('data', (d) => process.stderr.write(`[preview] ${d}`));

  try {
    await waitForServer(BASE_URL);
    console.log(`Server responsive at ${BASE_URL}`);

    const screensDir = path.join(rootDir, 'docs/screens');
    if (!fs.existsSync(screensDir)) fs.mkdirSync(screensDir, { recursive: true });

    const browser = await chromium.launch();
    const results = {
      timestamp: new Date().toISOString(),
      routesAudited: ROUTES.length,
      consoleErrors: [],
      axeViolations: [],
      overflowViolations: [],
      typographyChecks: [],
      screenshots: [],
    };

    // Audit loop
    for (const route of ROUTES) {
      console.log(`\n--- Auditing Route: ${route.path} (${route.name}) ---`);

      // 1. Desktop Light (1280x800)
      const contextDesktopLight = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const pageDesktopLight = await contextDesktopLight.newPage();
      const consoleErrors = [];
      pageDesktopLight.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push({ route: route.path, text: msg.text() });
        }
      });

      await pageDesktopLight.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await pageDesktopLight.waitForTimeout(500);

      // Check base font size
      const bodyFontSize = await pageDesktopLight.evaluate(() => {
        return parseFloat(window.getComputedStyle(document.body).fontSize);
      });
      results.typographyChecks.push({
        route: route.path,
        fontSizePx: bodyFontSize,
        pass: bodyFontSize >= 18,
      });

      // Accessibility Axe Scan (Desktop Light)
      const axeResult = await new AxeBuilder({ page: pageDesktopLight })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const criticalViolations = axeResult.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      if (criticalViolations.length > 0) {
        results.axeViolations.push({
          route: route.path,
          violations: criticalViolations.map((v) => ({ id: v.id, impact: v.impact, desc: v.description })),
        });
      }

      // Screenshot Desktop Light
      const fileDesktopLight = path.join(screensDir, `${route.name}-desktop-light.png`);
      await pageDesktopLight.screenshot({ path: fileDesktopLight, fullPage: true });
      results.screenshots.push(`docs/screens/${route.name}-desktop-light.png`);
      await contextDesktopLight.close();

      // 2. Desktop Dark (1280x800)
      const contextDesktopDark = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const pageDesktopDark = await contextDesktopDark.newPage();
      await pageDesktopDark.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await pageDesktopDark.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cover_theme', 'dark');
      });
      await pageDesktopDark.waitForTimeout(400);

      const fileDesktopDark = path.join(screensDir, `${route.name}-desktop-dark.png`);
      await pageDesktopDark.screenshot({ path: fileDesktopDark, fullPage: true });
      results.screenshots.push(`docs/screens/${route.name}-desktop-dark.png`);
      await contextDesktopDark.close();

      // 3. Mobile Light (360x740)
      const contextMobileLight = await browser.newContext({ viewport: { width: 360, height: 740 } });
      const pageMobileLight = await contextMobileLight.newPage();
      await pageMobileLight.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await pageMobileLight.waitForTimeout(400);

      // Overflow check at 360px
      const overflow = await pageMobileLight.evaluate(() => {
        const root = document.documentElement;
        return {
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
          hasHorizontalScroll: root.scrollWidth > root.clientWidth,
        };
      });

      if (overflow.hasHorizontalScroll) {
        results.overflowViolations.push({
          route: route.path,
          scrollWidth: overflow.scrollWidth,
          clientWidth: overflow.clientWidth,
        });
      }

      const fileMobileLight = path.join(screensDir, `${route.name}-mobile-light.png`);
      await pageMobileLight.screenshot({ path: fileMobileLight, fullPage: true });
      results.screenshots.push(`docs/screens/${route.name}-mobile-light.png`);
      await contextMobileLight.close();

      // 4. Mobile Dark (360x740)
      const contextMobileDark = await browser.newContext({ viewport: { width: 360, height: 740 } });
      const pageMobileDark = await contextMobileDark.newPage();
      await pageMobileDark.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await pageMobileDark.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cover_theme', 'dark');
      });
      await pageMobileDark.waitForTimeout(400);

      const fileMobileDark = path.join(screensDir, `${route.name}-mobile-dark.png`);
      await pageMobileDark.screenshot({ path: fileMobileDark, fullPage: true });
      results.screenshots.push(`docs/screens/${route.name}-mobile-dark.png`);
      await contextMobileDark.close();


      if (consoleErrors.length > 0) {
        results.consoleErrors.push(...consoleErrors);
      }
    }

    await browser.close();

    // Save summary
    const auditFile = path.join(rootDir, 'docs/browser_audit.json');
    fs.writeFileSync(auditFile, JSON.stringify(results, null, 2), 'utf8');

    console.log('\n======================================================');
    console.log('AUDIT SUMMARY');
    console.log('======================================================');
    console.log(`Routes Audited:             ${results.routesAudited}`);
    console.log(`Console Errors:             ${results.consoleErrors.length}`);
    console.log(`Axe Critical/Serious:       ${results.axeViolations.length}`);
    console.log(`360px Overflow Violations:  ${results.overflowViolations.length}`);
    console.log(`Screenshots Captured:       ${results.screenshots.length}`);
    console.log(`Saved report:               docs/browser_audit.json`);

    if (
      results.consoleErrors.length > 0 ||
      results.axeViolations.length > 0 ||
      results.overflowViolations.length > 0
    ) {
      console.error('\nFAIL: Browser audit discovered issues:');
      if (results.consoleErrors.length > 0) console.error('Console errors:', results.consoleErrors);
      if (results.axeViolations.length > 0) console.error('Axe violations:', results.axeViolations);
      if (results.overflowViolations.length > 0) console.error('Overflow violations:', results.overflowViolations);
      process.exitCode = 1;
    } else {
      console.log('\nPASS: All browser checks clean!');
    }
  } finally {
    console.log('Stopping preview server...');
    server.kill();
  }
}

runAudit().catch((err) => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
