# AGENTS.md

Tool-neutral instructions for **any** AI coding agent (Claude Code, Cursor, GitHub Copilot, Codex, etc.) working in this repository. Claude Code additionally loads [`CLAUDE.md`](./CLAUDE.md), which extends this file with Claude-specific detail; where the two overlap they agree, and `CLAUDE.md` wins for Claude Code.

---

## What this repo is

A **Playwright + TypeScript** regression test suite for the website defined in [`site.config.json`](./site.config.json) (currently **Huub** — https://www.joinhuub.com). It follows the **Page Object Model (POM)** and object-oriented design so the same framework can test any site by editing one config file.

Goal: comprehensive **smoke, functional, and regression** coverage of the live site's GUI and features — **without ever registering, logging in, or submitting a form.**

---

## Setup & commands

```bash
npm install
npx playwright install --with-deps

npm test                 # full suite
npm run test:smoke       # @smoke only
npm run test:functional  # @functional only
npm run test:regression  # full regression pass
npm run typecheck        # tsc --noEmit  (run before finishing ANY change)
npm run lint             # ESLint
npm run baseline         # refresh @visual snapshots after intended UI changes
```

Environment: Node 18+ (20 LTS recommended). The base URL comes from `site.config.json`, overridable with the `SITE_URL` env var.

---

## Golden rules (do not violate)

1. **POM only.** Every page/section is a class in `src/pages/` that extends `BasePage`. Locators are `readonly Locator` properties; methods are user *actions*.
2. **No assertions in page objects.** `expect()` belongs in tests, never in `src/pages/`.
3. **Tests import from the fixture:** `import { test, expect } from '@fixtures/site.fixture'` — never from `@playwright/test` directly.
4. **Tests use page objects,** not raw `page.locator()` in the test body.
5. **Never submit forms, log in, create accounts, or enter credentials/passwords.** Presence, structure, and validation only.
6. **Never hardcode the URL.** Use `siteConfig.url`.
7. **No `page.waitForTimeout()`.** Use web-first assertions / auto-waiting / `waitForSelector` / `waitForLoadState`.
8. **Tag every test** with one of: `@smoke @navigation @forms @functional @visual @responsive`.
9. **TypeScript strict.** Everything typed; no unjustified `any`.
10. **Verify before finishing:** `npm run typecheck` must be clean.

---

## Workflow for writing or updating tests

1. Read `site.config.json` first (URL + flags: `hasContactForm`, `skipForms`, `skipVisual`, `expectedNavItems`, `auth`).
2. Inspect the live page (WebFetch / browsing) before writing selectors — use **real, resilient** selectors (prefer roles and semantic attributes over brittle class names).
3. Add or update the relevant page object in `src/pages/`, then register it in `src/fixtures/site.fixture.ts`.
4. Write the test in the correct `tests/<category>/` folder, tagged appropriately, driving the page object.
5. Run `npm run typecheck` (and `npm run lint`) and fix everything before finishing.

---

## Subagents available in this repo

Defined in [`.claude/agents/`](./.claude/agents/) (Claude Code) and documented for all tools here:

| Agent | Use it to… |
|-------|-----------|
| **site-analyzer** | Crawl a live site and produce a fully populated `site.config.json`. |
| **test-generator** | Generate site-specific Playwright specs + page objects beyond the generic suites. |

See [`SKILLS.md`](./SKILLS.md) for the full catalog of slash commands and agents and when to use each.

---

## Directory map

```
site.config.json      playwright.config.ts      global-setup.ts
src/pages/            # POM classes (extend BasePage)
src/fixtures/         # custom test fixtures
src/utils/  src/types/
tests/{smoke,navigation,forms,functional,visual,responsive}/
.claude/{agents,commands,hooks}/     # agentic config
.github/                              # CI + AI-tool instructions (see .github/README.md)
```

---

## Do not

- Submit any form · create accounts · log in · enter passwords.
- Hardcode the base URL.
- Put `expect()` in page objects.
- Use `page.waitForTimeout()`.
- Use `any` without an explicit justification comment.
- Commit `@visual` snapshot churn without confirming the UI change was intentional.
