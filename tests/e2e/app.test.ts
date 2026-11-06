import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Cover Application End-to-End Suite', () => {
  test('Landing page renders promise, 3-step explainer, and Preview badge', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    // Assert title & preview badge
    await expect(page.locator('h1')).toContainText('Parametric Web Service Protection');
    await expect(page.getByText('Preview', { exact: true }).first()).toBeVisible();

    // Assert 3-step explainer
    await expect(page.getByText('Define Coverage Product')).toBeVisible();
    await expect(page.getByText('Purchase Protection')).toBeVisible();
    await expect(page.getByText('Consensus Settlement')).toBeVisible();

    // Assert demo credits notice
    await expect(page.getByText('Credits are demo credits on GenLayer studionet, not money.').first()).toBeVisible();

    // Assert zero console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('Products page displays zero-wallet readable catalogue', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('h1')).toContainText('Parametric Products');
    await expect(page.getByPlaceholder('Filter by name, ID, or URL...')).toBeVisible();
  });

  test('Create product page enforces strict client-side validations', async ({ page }) => {
    await page.goto('/products/new');
    await expect(page.locator('h1')).toContainText('Create Coverage Product');

    // Fill invalid URL
    await page.fill('#name', 'Test Service');
    await page.fill('#sourceUrl', 'http://insecure-domain.com'); // HTTP not allowed
    await page.click('button[type="submit"]');

    await expect(page.getByText('bad URL: scheme must be https')).toBeVisible();
  });

  test('Evidence page loads matrix, balance snapshots, and superseded table', async ({ page }) => {
    await page.goto('/evidence');
    await expect(page.locator('h1')).toContainText('Contract Verification & Evidence');

    // Assert balance invariant header
    await expect(page.getByText('Conservation of Balance Invariant')).toBeVisible();

    // Assert superseded notice is strictly present
    await expect(page.getByText('Superseded Deployments')).toBeVisible();
    await expect(page.getByText('0x4d12d00d527869a6a6f95358A11589ecf3C347e3')).toBeVisible();
  });

  test('Limits page displays contract operational bounds', async ({ page }) => {
    await page.goto('/limits');
    await expect(page.locator('h1')).toContainText('Operational Limits & Boundaries');
    await expect(page.getByText('Financial Bounds')).toBeVisible();
    await expect(page.getByText('Coverage Term & Thresholds')).toBeVisible();
  });

  test('CoverGuard page allows address query and gate inspection', async ({ page }) => {
    await page.goto('/guard');
    await expect(page.locator('h1')).toContainText('CoverGuard V2 Gatekeeper');
    await expect(page.getByPlaceholder('e.g. 1')).toBeVisible();
  });

  test('Axe accessibility scan passes on Landing Page with 0 critical or serious violations', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toHaveLength(0);
  });
});
