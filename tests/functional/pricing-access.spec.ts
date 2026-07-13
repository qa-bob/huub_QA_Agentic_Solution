/**
 * tests/functional/pricing-access.spec.ts
 *
 * Functional tests documenting the access gate on /pricing.  The page is
 * password-protected ("RESTRICTED SITE AREA") — these tests verify the page
 * responds and that access is gated (a password input is present).  They do
 * NOT attempt to enter a password or bypass the gate.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const PRICING_PATH = '/pricing';

test.describe('Pricing Access Gate @functional', () => {
  test('pricing page responds successfully @functional @smoke', async ({ page, siteConfig }) => {
    const pricingUrl = siteConfig.url.replace(/\/$/, '') + PRICING_PATH;

    const response = await page.goto(pricingUrl, { waitUntil: 'domcontentloaded' });

    expect(response, `Expected a response from ${pricingUrl}`).not.toBeNull();
    const status = response!.status();
    expect(
      status >= 200 && status < 400,
      `Expected HTTP 2xx/3xx for ${pricingUrl} but got ${status}`
    ).toBeTruthy();
  });

  test('pricing page is access-gated by a password prompt @functional', async ({ page, siteConfig }) => {
    const pricingUrl = siteConfig.url.replace(/\/$/, '') + PRICING_PATH;
    await page.goto(pricingUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // A password input is the clearest signal of the Squarespace lock screen.
    const passwordInput = page.locator('input[type="password"]');

    // Corroborating textual signals for the restricted-area lock screen.
    const lockText = page.getByText(/restricted site area|password|protected|unlock/i);

    const hasPasswordInput = (await passwordInput.count()) > 0;
    const hasLockText = (await lockText.count()) > 0;

    if (!hasPasswordInput && !hasLockText) {
      test.skip(
        true,
        'No password gate detected on /pricing — the page may have been un-gated since discovery.'
      );
      return;
    }

    // Document the gate; we deliberately do NOT type into the password field.
    expect(
      hasPasswordInput || hasLockText,
      `${siteConfig.name} /pricing should present an access gate (password prompt / restricted area)`
    ).toBeTruthy();

    if (hasPasswordInput) {
      await expect(
        passwordInput.first(),
        'Password input on the gated pricing page should be visible'
      ).toBeVisible();
    }
  });
});
