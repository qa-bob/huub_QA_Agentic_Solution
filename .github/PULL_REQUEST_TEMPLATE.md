## What & why

<!-- What does this PR change, and why? Link any issue: Closes #123 -->

## Type of change
- [ ] New test coverage
- [ ] New / updated page object
- [ ] Framework / config change
- [ ] Docs
- [ ] Fix (flaky test, broken selector, etc.)

## Checklist
- [ ] Tests import `{ test, expect }` from `@fixtures/site.fixture` and drive **page objects** (no raw `page.locator()` in test bodies).
- [ ] New page objects **extend `BasePage`**; no `expect()` inside page objects.
- [ ] Every new/changed test is **tagged** (`@smoke` / `@navigation` / `@forms` / `@functional` / `@visual` / `@responsive`).
- [ ] **No** form submission, login, account creation, or credentials.
- [ ] **No** hardcoded URLs (reads `siteConfig.url`) and **no** `page.waitForTimeout()`.
- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run lint` is clean.
- [ ] Ran the affected suite locally (`npm test` or a tagged subset).
- [ ] If UI changed intentionally, refreshed `@visual` baselines (`npm run baseline`) and committed them.
- [ ] Updated `site.config.json` / docs if the site structure changed.

## Test evidence
<!-- Paste the run summary, or attach the HTML report / screenshots. -->
