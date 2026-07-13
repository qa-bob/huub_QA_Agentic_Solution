/**
 * src/pages/resources.page.ts
 *
 * ResourcesPage models a resources / articles / case-studies listing page.
 * It is parameterised via navigateTo(path) so it can serve /resources,
 * /articles, /case-studies, etc.
 *
 * Uses semantic, role-based selectors and avoids Squarespace-specific class
 * names where possible.  No expect() calls — assertions belong in the tests.
 */

import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface ResourceLinkInfo {
  text: string;
  href: string;
}

export class ResourcesPage extends BasePage {
  // ── Navigation ────────────────────────────────────────────────────────────────

  /**
   * Navigate to a listing sub-path (e.g. "/resources", "/articles").
   * The base URL is read from config and never hardcoded.
   */
  async navigateTo(path: string): Promise<void> {
    const base = this.config.url.replace(/\/$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    await this.page.goto(base + suffix, { waitUntil: 'domcontentloaded' });
  }

  // ── Resource discovery ──────────────────────────────────────────────────────

  /**
   * Return the locator for the main content region that holds resource items.
   * Prefers the <main> landmark, falling back to <article> containers or the
   * document body.
   */
  private getContentLocator(): Locator {
    return this.page.locator('main, [role="main"]').first();
  }

  /**
   * Return the resource / article links rendered in the listing.
   *
   * Strategy (in priority order):
   *  1. Links inside <article> elements (Squarespace blog/summary items)
   *  2. Links inside the main content region that point to article-like paths
   *  3. Any in-content links with meaningful text
   *
   * Navigation, footer, and social links are excluded by scoping to the main
   * content region and filtering out empty / anchor-only hrefs.
   */
  async getResourceLinks(): Promise<ResourceLinkInfo[]> {
    const siteOrigin = new URL(this.config.url).origin;

    // Strategy 1: links within <article> items
    const articleLinks = this.page.locator('article a[href]');
    if (await articleLinks.count() > 0) {
      return this.collectLinks(articleLinks, siteOrigin);
    }

    // Strategy 2: content-scoped links pointing at article-like paths
    const content = this.getContentLocator();
    if (await content.count() > 0) {
      const pathLinks = content
        .locator('a[href]')
        .filter({
          has: this.page.locator('h1, h2, h3, img'),
        });
      if (await pathLinks.count() > 0) {
        return this.collectLinks(pathLinks, siteOrigin);
      }

      // Strategy 3: any meaningful content link
      return this.collectLinks(content.locator('a[href]'), siteOrigin);
    }

    return [];
  }

  /**
   * Convert a link locator into de-duplicated ResourceLinkInfo entries,
   * skipping empty / anchor-only / off-site social links.
   */
  private async collectLinks(
    links: Locator,
    siteOrigin: string
  ): Promise<ResourceLinkInfo[]> {
    const count = await links.count();
    const seen = new Set<string>();
    const results: ResourceLinkInfo[] = [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = ((await link.textContent()) ?? '').trim();
      const href = (await link.getAttribute('href')) ?? '';

      if (!href || href === '#' || href.startsWith('javascript:')) continue;

      let resolved: string;
      try {
        resolved = new URL(href, this.config.url).toString();
      } catch {
        continue;
      }

      // Skip common off-site social/share links that are not resources
      if (
        /facebook|twitter|linkedin|instagram|youtube|mailto:|tel:/i.test(resolved) &&
        !resolved.startsWith(siteOrigin)
      ) {
        continue;
      }

      if (seen.has(resolved)) continue;
      seen.add(resolved);

      results.push({ text, href: resolved });
    }

    return results;
  }

  /**
   * Count the discoverable resource / article links on the page.
   */
  async countResources(): Promise<number> {
    const links = await this.getResourceLinks();
    return links.length;
  }

  // ── Load verification ─────────────────────────────────────────────────────────

  /**
   * Returns true when the listing rendered meaningful content:
   * a heading is present and the body has substantive text.
   */
  async isLoaded(): Promise<boolean> {
    try {
      const headingCount = await this.page.locator('h1, h2, h3').count();
      if (headingCount === 0) return false;

      const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
      return bodyText.trim().length >= 50;
    } catch {
      return false;
    }
  }
}
