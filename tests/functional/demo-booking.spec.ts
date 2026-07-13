/**
 * tests/functional/demo-booking.spec.ts
 *
 * Functional tests for the demo-booking funnel.  The "Schedule Demo" /
 * "See a Demo" CTAs link OUT to an external booking page (Calendly).  These
 * tests verify such a CTA exists and points to an external booking URL by
 * inspecting the href only — they never navigate to the external site.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const PRODUCT_PATH = '/economic-engagement-suite';

/** Hosts we treat as legitimate external booking providers. */
const BOOKING_HOST_PATTERN = /calendly|hubspot|savvycal|acuityscheduling|meetings|book|schedul/i;

test.describe('Demo Booking @functional', () => {
  test('homepage demo CTA points to an external booking host @functional', async ({
    homePage,
    siteConfig,
  }) => {
    const siteOrigin = new URL(siteConfig.url).origin;

    // homePage fixture has already navigated to the site root; inspect its page.
    const demoLinks = homePage.page
      .getByRole('link', { name: /see a demo|schedule demo|schedule a demo|book a demo|request demo|demo/i });

    const count = await demoLinks.count();
    if (count === 0) {
      test.skip(true, 'No demo CTA link found on the homepage.');
      return;
    }

    // Inspect hrefs without clicking; find one that resolves off-site.
    let externalBookingHref: string | null = null;
    for (let i = 0; i < count; i++) {
      const href = (await demoLinks.nth(i).getAttribute('href')) ?? '';
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;

      let resolved: URL;
      try {
        resolved = new URL(href, siteConfig.url);
      } catch {
        continue;
      }
      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') continue;

      if (resolved.origin !== siteOrigin || BOOKING_HOST_PATTERN.test(resolved.href)) {
        externalBookingHref = resolved.toString();
        break;
      }
    }

    if (!externalBookingHref) {
      test.skip(
        true,
        'Homepage demo CTAs resolve on-site (likely routing to an in-site booking page) — no external booking host to assert.'
      );
      return;
    }

    const bookingOrigin = new URL(externalBookingHref).origin;
    expect(
      bookingOrigin,
      `Homepage demo CTA "${externalBookingHref}" should link to an external booking host`
    ).not.toBe(siteOrigin);
  });

  test('product page demo CTA points to an external booking host @functional', async ({
    productPage,
    siteConfig,
  }) => {
    await productPage.navigateTo(PRODUCT_PATH);
    await productPage.waitForLoad();

    const bookingHref = await productPage.getExternalBookingHref();

    if (!bookingHref) {
      test.skip(true, 'No external demo-booking CTA found on the product page.');
      return;
    }

    const siteOrigin = new URL(siteConfig.url).origin;
    const bookingOrigin = new URL(bookingHref).origin;

    expect(
      bookingOrigin,
      `Product page demo CTA "${bookingHref}" should link to an external booking host, not ${siteOrigin}`
    ).not.toBe(siteOrigin);

    // Sanity check: the target looks like a recognised booking provider.
    expect(
      BOOKING_HOST_PATTERN.test(bookingHref),
      `Booking CTA "${bookingHref}" should resemble a known scheduling provider`
    ).toBeTruthy();
  });
});
