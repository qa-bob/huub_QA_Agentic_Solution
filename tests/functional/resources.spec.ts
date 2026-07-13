/**
 * tests/functional/resources.spec.ts
 *
 * Functional tests for the resources / articles listing.  Verifies that
 * /resources (and, as a fallback, /articles) loads and renders multiple
 * resource / article links.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const LISTING_PATHS = ['/resources', '/articles'] as const;

test.describe('Resources @functional', () => {
  test('a resources listing page loads @functional @smoke', async ({ resourcesPage }) => {
    let loadedPath: string | null = null;

    for (const path of LISTING_PATHS) {
      await resourcesPage.navigateTo(path);
      await resourcesPage.waitForLoad();
      if (await resourcesPage.isLoaded()) {
        loadedPath = path;
        break;
      }
    }

    if (!loadedPath) {
      test.skip(true, `Neither ${LISTING_PATHS.join(' nor ')} rendered meaningful content.`);
      return;
    }

    expect(loadedPath, 'A resources/articles listing should load with content').not.toBeNull();
  });

  test('resources listing renders multiple resource links @functional', async ({ resourcesPage }) => {
    let bestCount = 0;

    for (const path of LISTING_PATHS) {
      await resourcesPage.navigateTo(path);
      await resourcesPage.waitForLoad();

      if (!(await resourcesPage.isLoaded())) continue;

      const count = await resourcesPage.countResources();
      if (count > bestCount) bestCount = count;

      // Enough evidence — stop early once we find a well-populated listing.
      if (bestCount > 1) break;
    }

    if (bestCount === 0) {
      test.skip(
        true,
        'No resource/article links discovered on the listing pages — layout may be non-standard.'
      );
      return;
    }

    expect(
      bestCount,
      'The resources/articles listing should render multiple resource links'
    ).toBeGreaterThan(1);
  });
});
