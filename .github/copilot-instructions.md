# GitHub Copilot Instructions

Repository-wide guidance for GitHub Copilot (Chat, code completion, and the coding agent). These mirror [`AGENTS.md`](../AGENTS.md) and [`CLAUDE.md`](../CLAUDE.md) — keep all three in sync.

## Project
This is a **Playwright + TypeScript** regression test suite for the website in [`site.config.json`](../site.config.json) (Huub — https://www.joinhuub.com), built with the **Page Object Model** and OOP. It provides smoke, functional, and regression coverage of the live site **without ever registering, logging in, or submitting a form.**

## When generating or editing code, always
- Put page logic in a class under `src/pages/` that **extends `BasePage`**; expose locators as `readonly Locator` and methods as user *actions*. **No `expect()` in page objects.**
- In tests, import `{ test, expect }` from `@fixtures/site.fixture` (never `@playwright/test`) and drive the page through its page object rather than raw `page.locator()`.
- Read the base URL from `siteConfig.url` — **never hardcode a URL**.
- Tag every test with one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`.
- Prefer resilient selectors: roles (`getByRole`), semantic attributes, and text over brittle CSS classes.
- Use web-first assertions and auto-waiting — **never `page.waitForTimeout()`**.
- Keep TypeScript **strict**: type everything; avoid `any` without a justifying comment.

## Never
- Submit a form, create an account, log in, or enter a password/credentials.
- Hardcode URLs or secrets.
- Add assertions inside page objects.

## Before considering a change done
Run `npm run typecheck` (must be clean) and `npm run lint`. See [`.github/instructions/`](./instructions/) for path-scoped rules.
