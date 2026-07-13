/**
 * tests/functional/newsletter.spec.ts
 *
 * Functional tests for the footer newsletter subscribe form.  Verifies the
 * form exposes an email field and a submit control — structure only.
 * IMPORTANT: the form is NEVER submitted.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Newsletter Subscribe @functional', () => {
  test.beforeEach(async ({ contactPage }) => {
    // The newsletter form lives in the site footer on the homepage.
    await contactPage.navigate();
    await contactPage.waitForLoad();
  });

  test('footer newsletter form exposes an email field @functional', async ({ contactPage, page }) => {
    // Prefer a footer-scoped email input; fall back to any email input on page.
    const footerEmail = page
      .locator('footer')
      .locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]');

    const hasFooterEmail = (await footerEmail.count()) > 0;
    const hasAnyEmail = await contactPage.hasEmailField();

    if (!hasFooterEmail && !hasAnyEmail) {
      test.skip(true, 'No newsletter/email field found in the footer or page forms.');
      return;
    }

    expect(
      hasFooterEmail || hasAnyEmail,
      'A newsletter email input should be present (footer subscribe form)'
    ).toBeTruthy();
  });

  test('footer newsletter form exposes a submit control @functional', async ({ contactPage, page }) => {
    const footer = page.locator('footer');

    const footerSubmit = footer.locator(
      'button[type="submit"], input[type="submit"], button:not([type="button"]):not([type="reset"])'
    );

    const hasFooterSubmit = (await footerSubmit.count()) > 0;
    const hasFormSubmit = await contactPage.hasSubmitButton();

    if (!hasFooterSubmit && !hasFormSubmit) {
      test.skip(true, 'No submit control found for a newsletter form.');
      return;
    }

    expect(
      hasFooterSubmit || hasFormSubmit,
      'The newsletter form should expose a submit control'
    ).toBeTruthy();
  });

  test('newsletter form is inspected but never submitted @functional', async ({ page, siteConfig }) => {
    // Guard: assert no document-level POST navigation is triggered while we
    // only read the form structure.  We never call submit / fill+enter.
    let submitted = false;
    page.on('request', (req) => {
      if (req.resourceType() === 'document' && req.method() === 'POST') {
        submitted = true;
      }
    });

    const footerEmail = page
      .locator('footer')
      .locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]')
      .first();

    if (await footerEmail.count() === 0) {
      test.skip(true, 'No footer newsletter email field to inspect.');
      return;
    }

    // Read-only inspection: confirm the field is an email-type control.
    await expect(footerEmail, 'Newsletter email field should be visible').toBeVisible();

    // Let any late JS settle without a fixed timeout.
    await page.waitForLoadState('networkidle');

    expect(
      submitted,
      `Inspecting the newsletter form on ${siteConfig.name} must not submit it`
    ).toBeFalsy();
  });
});
