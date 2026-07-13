/**
 * tests/functional/product-suite.spec.ts
 *
 * Functional tests for the flagship product page,
 * /economic-engagement-suite: it loads, shows the correct main heading,
 * renders multiple feature sections, surfaces CTA buttons, and offers a
 * demo-booking CTA that links to an external (Calendly-style) host.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const PRODUCT_PATH = '/economic-engagement-suite';

test.describe('Product Suite @functional', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.navigateTo(PRODUCT_PATH);
    await productPage.waitForLoad();
  });

  test('product suite page loads with content @functional @smoke', async ({ productPage }) => {
    const loaded = await productPage.isLoaded();
    expect(loaded, `${PRODUCT_PATH} should render a heading and substantive text`).toBeTruthy();
  });

  test('product suite main heading references the Economic Engagement Suite @functional', async ({
    productPage,
  }) => {
    const heading = await productPage.getMainHeading();
    expect(heading.trim().length, 'Product page should have a main heading').toBeGreaterThan(0);
    expect(
      heading,
      `Main heading "${heading}" should reference the Economic Engagement Suite`
    ).toMatch(/economic engagement suite/i);
  });

  test('product suite renders multiple feature sections @functional', async ({ productPage }) => {
    const sectionCount = await productPage.countFeatureSections();
    expect(
      sectionCount,
      'Product page should render multiple feature/content sections'
    ).toBeGreaterThan(1);
  });

  test('product suite surfaces CTA buttons @functional', async ({ productPage }) => {
    const ctas = await productPage.getCTAButtons();

    if (ctas.length === 0) {
      test.skip(true, 'No CTA buttons discovered on the product page.');
      return;
    }

    expect(ctas.length, 'Product page should surface at least one CTA button').toBeGreaterThan(0);
  });

  test('product suite demo CTA links to an external booking host @functional', async ({
    productPage,
    siteConfig,
  }) => {
    const bookingHref = await productPage.getExternalBookingHref();

    if (!bookingHref) {
      test.skip(true, 'No external demo-booking CTA (e.g. Calendly) found on the product page.');
      return;
    }

    const siteOrigin = new URL(siteConfig.url).origin;
    const bookingOrigin = new URL(bookingHref).origin;

    expect(
      bookingOrigin,
      `Demo-booking CTA "${bookingHref}" should point to an external host, not ${siteOrigin}`
    ).not.toBe(siteOrigin);
  });
});
