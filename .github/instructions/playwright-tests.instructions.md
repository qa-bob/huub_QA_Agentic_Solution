---
applyTo: "tests/**/*.spec.ts"
---

# Rules for test spec files (`tests/**/*.spec.ts`)

- Import `{ test, expect }` from `@fixtures/site.fixture`, never from `@playwright/test`.
- Start each file with a JSDoc header: what it covers and its tag.
- Every `test(...)` title ends with its tag(s): `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, or `@responsive`.
- Drive the page through a page object from `src/pages/`; avoid raw `page.locator()` in the test body.
- Read the URL from `siteConfig.url`; build sub-paths as `siteConfig.url.replace(/\/$/, '') + '/path'`.
- Never submit forms, log in, or enter credentials. For optional/absent elements, `test.skip(true, '<reason>')` — do not hard-fail.
- No `page.waitForTimeout()`. Use web-first assertions, `expect(locator).toBeVisible()`, `waitForSelector`, or `waitForLoadState`.
- Keep tests independent and idempotent; assume any test may run first or in isolation.
