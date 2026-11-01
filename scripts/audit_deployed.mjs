import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'docs/deployed_audit');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEPLOYED_BASE_URL = 'https://hypercybers99.github.io/cover-app';

async function main() {
  console.log('======================================================');
  console.log('DEPLOYED URL AUDIT & DEEP LINK VERIFICATION');
  console.log(`Target: ${DEPLOYED_BASE_URL}`);
  console.log('======================================================');

  const browser = await chromium.launch();
  const consoleErrors = [];

  // ---------------------------------------------------------------------------
  // 1. Three SPA Deep Links Verification
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. Proving 3 SPA Deep Links on Deployed URL ---');
  const deepLinks = [
    {
      name: 'Product Detail #2',
      url: `${DEPLOYED_BASE_URL}/products/2`,
      expectedText: 'PRODUCT #2',
      screenshot: 'deeplink_products_2.png',
    },
    {
      name: 'Policy Detail #5',
      url: `${DEPLOYED_BASE_URL}/policies/5`,
      expectedText: 'Policy #5',
      screenshot: 'deeplink_policies_5.png',
    },
    {
      name: 'CoverGuard Gateway',
      url: `${DEPLOYED_BASE_URL}/guard`,
      expectedText: 'CoverGuard',
      screenshot: 'deeplink_guard.png',
    },
  ];

  const deepLinkResults = [];

  for (const item of deepLinks) {
    console.log(`\nOpening direct deep link: ${item.url}`);
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('favicon')) {
          consoleErrors.push({ url: item.url, error: text });
        }
      }
    });

    const res = await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
    const httpStatus = res ? res.status() : 0;

    // Wait for client-side rendering
    await page.waitForTimeout(3500);

    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasExpectedContent = bodyText.includes(item.expectedText);
    const is404FallbackPage = bodyText.includes('404 - Page Not Found') || bodyText.includes('Page not found');

    const screenshotPath = path.join(outDir, item.screenshot);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const result = {
      name: item.name,
      url: item.url,
      http_status_served: httpStatus,
      client_rendered_page: !is404FallbackPage && hasExpectedContent,
      page_title: title,
      expected_text_found: hasExpectedContent,
      screenshot: item.screenshot,
    };
    deepLinkResults.push(result);

    console.log(`  Rendered page successfully: ${result.client_rendered_page}`);
    console.log(`  Expected text '${item.expectedText}' found: ${hasExpectedContent}`);
    console.log(`  Saved screenshot: docs/deployed_audit/${item.screenshot}`);

    await page.close();
  }

  fs.writeFileSync(path.join(outDir, 'deep_links.json'), JSON.stringify(deepLinkResults, null, 2));

  // ---------------------------------------------------------------------------
  // 2. Deployed URL Audits: Console, Axe (Light & Dark), 360px Overflow, 18px Text, Zero-Wallet Read
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Deployed URL Audits (Console, Axe, Overflow, Typography, Zero-Wallet Read) ---');

  // A. Home Page Light Theme
  const contextLight = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageLight = await contextLight.newPage();
  await pageLight.goto(`${DEPLOYED_BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await pageLight.waitForTimeout(2000);

  const axeLight = await new AxeBuilder({ page: pageLight })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const axeLightViolations = axeLight.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );
  await pageLight.screenshot({ path: path.join(outDir, 'deployed_home_light.png'), fullPage: true });

  // 18px text check
  const bodyFontSize = await pageLight.evaluate(() => {
    return window.getComputedStyle(document.body).fontSize;
  });
  const fontSizePx = parseFloat(bodyFontSize) || 0;
  const passes18px = fontSizePx >= 18;
  console.log(`  Computed base font-size: ${bodyFontSize} (>= 18px: ${passes18px})`);

  // B. Home Page Dark Theme
  // Click theme toggle button
  await pageLight.click('button[aria-label*="theme" i], button[aria-label*="mode" i], button:has(svg.lucide-moon), button:has(svg.lucide-sun)');
  await pageLight.waitForTimeout(1000);

  const axeDark = await new AxeBuilder({ page: pageLight })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const axeDarkViolations = axeDark.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );
  await pageLight.screenshot({ path: path.join(outDir, 'deployed_home_dark.png'), fullPage: true });

  await pageLight.close();
  await contextLight.close();

  // C. 360px Mobile Viewport Overflow Check
  const pageMobile = await browser.newPage({ viewport: { width: 360, height: 740 } });
  await pageMobile.goto(`${DEPLOYED_BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await pageMobile.waitForTimeout(2000);

  const overflow = await pageMobile.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    return {
      scrollWidth,
      clientWidth,
      hasOverflow: scrollWidth > clientWidth,
    };
  });
  console.log(`  360px viewport width: ${overflow.clientWidth}px, scrollWidth: ${overflow.scrollWidth}px (overflow: ${overflow.hasOverflow})`);
  await pageMobile.screenshot({ path: path.join(outDir, 'deployed_360px.png'), fullPage: true });
  await pageMobile.close();

  // D. Zero-Wallet Read (Products catalogue loads from Studionet)
  console.log('\nTesting Zero-Wallet Read from Studionet on deployed products page...');
  const pageProducts = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await pageProducts.goto(`${DEPLOYED_BASE_URL}/products`, { waitUntil: 'networkidle', timeout: 30000 });
  await pageProducts.waitForTimeout(4000);

  const productsListText = await pageProducts.evaluate(() => document.body.innerText);
  const hasProductFromChain = productsListText.includes('App E2E Cloud Cover') || productsListText.includes('PRODUCT #2') || productsListText.includes('Nimbus');
  console.log(`  Zero-wallet chain readback: product catalogue rendered from chain = ${hasProductFromChain}`);
  await pageProducts.close();

  await browser.close();

  const auditReport = {
    deployed_url: DEPLOYED_BASE_URL,
    timestamp: new Date().toISOString(),
    console_errors_count: consoleErrors.length,
    console_errors: consoleErrors,
    typography_base_font_size: bodyFontSize,
    typography_ge_18px: passes18px,
    axe_light_violations: axeLightViolations.length,
    axe_dark_violations: axeDarkViolations.length,
    mobile_360px_overflow: overflow.hasOverflow,
    mobile_360px_scroll_width: overflow.scrollWidth,
    mobile_360px_client_width: overflow.clientWidth,
    zero_wallet_chain_read_success: hasProductFromChain,
    deep_links: deepLinkResults,
  };

  fs.writeFileSync(path.join(outDir, 'deployed_audit.json'), JSON.stringify(auditReport, null, 2));

  console.log('\n======================================================');
  console.log('DEPLOYED AUDIT SUMMARY');
  console.log('======================================================');
  console.log(`Deployed URL:            ${DEPLOYED_BASE_URL}`);
  console.log(`Console Errors:          ${consoleErrors.length}`);
  console.log(`Axe Light Violations:    ${axeLightViolations.length}`);
  console.log(`Axe Dark Violations:     ${axeDarkViolations.length}`);
  console.log(`360px Overflow:          ${overflow.hasOverflow}`);
  console.log(`Base Typography:         ${bodyFontSize} (Pass: ${passes18px})`);
  console.log(`Zero-Wallet Chain Read:  ${hasProductFromChain ? 'PASS' : 'FAIL'}`);
  console.log(`3/3 Deep Links Passed:   ${deepLinkResults.every((d) => d.client_rendered_page)}`);
  console.log(`Outputs Saved To:        docs/deployed_audit/`);
}

main().catch((err) => {
  console.error('Deployed audit failed:', err);
  process.exit(1);
});
