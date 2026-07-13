/**
 * src/pages/product.page.ts
 *
 * ProductPage models a marketing/product page (e.g. the Economic Engagement
 * Suite page).  It is intentionally generic and parameterised: call
 * navigateTo(path) to point it at any marketing page under the site.
 *
 * Uses semantic and role-based selectors to stay design-agnostic across the
 * Squarespace-rendered marketing pages.  No expect() calls live here —
 * assertions belong in the tests.
 */

import { BasePage } from '@pages/base.page';

export interface CTAInfo {
  text: string;
  href: string;
}

export class ProductPage extends BasePage {
  // ── Navigation ────────────────────────────────────────────────────────────────

  /**
   * Navigate to a sub-path of the site (e.g. "/economic-engagement-suite").
   * The path is joined onto the configured base URL — the base URL is never
   * hardcoded.  A leading slash on `path` is optional.
   */
  async navigateTo(path: string): Promise<void> {
    const base = this.config.url.replace(/\/$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    await this.page.goto(base + suffix, { waitUntil: 'domcontentloaded' });
  }

  // ── Headings ────────────────────────────────────────────────────────────────

  /**
   * Return the text of the main heading on the page.
   * Prefers the first <h1>, falling back to the first <h2> (some Squarespace
   * layouts promote section titles to h2).
   */
  async getMainHeading(): Promise<string> {
    const h1 = this.page.locator('h1').first();
    if (await h1.count() > 0) {
      const text = (await h1.textContent())?.trim();
      if (text && text.length > 0) return text;
    }

    const h2 = this.page.locator('h2').first();
    if (await h2.count() > 0) {
      return (await h2.textContent())?.trim() ?? '';
    }

    return '';
  }

  // ── Feature sections ──────────────────────────────────────────────────────────

  /**
   * Count the distinct content/feature sections on the page.
   * Squarespace renders content blocks as <section> elements; falls back to
   * counting sub-headings (h2/h3) when no <section> landmarks are present.
   */
  async countFeatureSections(): Promise<number> {
    const sections = this.page.locator('section, [class*="section" i]');
    const sectionCount = await sections.count();
    if (sectionCount > 0) return sectionCount;

    // Fallback: treat each secondary heading as a feature section marker
    return this.page.locator('h2, h3').count();
  }

  /**
   * Return the visible text of each secondary heading (h2/h3) on the page.
   * Useful for asserting that named feature areas (e.g. "Data & Reporting")
   * render.  Empty headings are filtered out.
   */
  async getFeatureHeadings(): Promise<string[]> {
    const headings = this.page.locator('h2, h3');
    const count = await headings.count();
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = ((await headings.nth(i).textContent()) ?? '').trim();
      if (text.length > 0) results.push(text);
    }

    return results;
  }

  // ── CTAs ──────────────────────────────────────────────────────────────────────

  /**
   * Return all call-to-action buttons/links on the page with their text + href.
   * Combines role="link"/"button" elements with common CTA phrasing found on
   * Huub marketing pages ("See a Demo", "Schedule Demo", "Register").
   */
  async getCTAButtons(): Promise<CTAInfo[]> {
    const ctaLocator = this.page
      .locator('a[href], button')
      .filter({
        hasText:
          /see a demo|schedule demo|schedule a demo|book a demo|request demo|register|get started|contact|learn more|sign up/i,
      });

    const count = await ctaLocator.count();
    const results: CTAInfo[] = [];

    for (let i = 0; i < count; i++) {
      const el = ctaLocator.nth(i);
      const text = ((await el.textContent()) ?? '').trim();
      const href = (await el.getAttribute('href')) ?? '';
      results.push({ text, href });
    }

    return results;
  }

  /**
   * Return the href of the first demo-booking CTA that links to an EXTERNAL
   * host (e.g. Calendly), or null if none is found.  Does NOT click through.
   *
   * "External" means the resolved link origin differs from the site origin.
   */
  async getExternalBookingHref(): Promise<string | null> {
    const siteOrigin = new URL(this.config.url).origin;

    const bookingLinks = this.page.locator('a[href]').filter({
      hasText: /see a demo|schedule demo|schedule a demo|book a demo|request demo/i,
    });

    const count = await bookingLinks.count();

    for (let i = 0; i < count; i++) {
      const href = (await bookingLinks.nth(i).getAttribute('href')) ?? '';
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;

      let resolved: URL;
      try {
        resolved = new URL(href, this.config.url);
      } catch {
        continue;
      }

      // Only http(s) links can be external booking pages
      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') continue;

      const isExternal = resolved.origin !== siteOrigin;
      const looksLikeBooking = /calendly|hubspot|savvycal|book|schedul|meet/i.test(
        resolved.href
      );

      if (isExternal || looksLikeBooking) {
        return resolved.toString();
      }
    }

    return null;
  }

  // ── Load verification ─────────────────────────────────────────────────────────

  /**
   * Returns true when the page has rendered meaningful content:
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
