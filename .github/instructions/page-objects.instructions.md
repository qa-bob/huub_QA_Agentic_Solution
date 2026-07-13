---
applyTo: "src/pages/**/*.page.ts"
---

# Rules for page object files (`src/pages/**/*.page.ts`)

- Every class **extends `BasePage`** from `@pages/base.page`.
- Declare locators as `readonly Locator` properties; type every property and return value.
- Methods represent **user actions** (`clickNavItem`, `fillForm`, `openMobileMenu`) or return data — they contain **no `expect()`** assertions.
- Prefer resilient, design-agnostic selectors: `getByRole`, semantic attributes, `getByText` — over brittle class/id selectors. Provide fallbacks where structure varies.
- Never submit forms or enter credentials inside a page object method.
- No `page.waitForTimeout()`; rely on Playwright auto-waiting / explicit `waitForLoadState`.
- After adding a page object, register it as a fixture in `src/fixtures/site.fixture.ts`.
