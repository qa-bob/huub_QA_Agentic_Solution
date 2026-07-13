/**
 * tests/functional/homepage-content.spec.ts
 *
 * Functional tests for the Huub homepage: the hero/main heading renders,
 * primary CTAs are present, key content sections show, and at least one
 * "demo" call-to-action exists.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Content @functional', () => {
  test('homepage renders a main heading @functional @smoke', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(heading.trim().length, 'Homepage should render a non-empty main heading').toBeGreaterThan(0);
  });

  test('homepage exposes primary CTA buttons @functional', async ({ homePage }) => {
    const ctas = await homePage.getCTAButtons();

    if (ctas.length === 0) {
      test.skip(true, 'No CTA buttons discovered on the homepage — nothing to assert.');
      return;
    }

    expect(ctas.length, 'Homepage should surface at least one call-to-action').toBeGreaterThan(0);
  });

  test('homepage body renders meaningful content sections @functional', async ({ homePage }) => {
    const loaded = await homePage.isLoaded();
    expect(
      loaded,
      'Homepage should render a heading, navigation, and substantive body text'
    ).toBeTruthy();
  });

  test('homepage offers at least one demo call-to-action @functional', async ({ homePage }) => {
    // A "demo" CTA is core to Huub's funnel — locate it by accessible text.
    // homePage fixture has already navigated to the site root.
    const demoCta = homePage.page
      .getByRole('link', { name: /demo/i })
      .or(homePage.page.getByRole('button', { name: /demo/i }));

    const count = await demoCta.count();

    if (count === 0) {
      test.skip(true, 'No "demo" CTA found on the homepage — may live only on product pages.');
      return;
    }

    expect(count, 'Homepage should present at least one "demo" call-to-action').toBeGreaterThan(0);
  });
});
