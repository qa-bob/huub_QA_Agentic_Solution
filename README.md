# Huub — QA Agentic Solution

> An automated **GUI, functional, and regression** test suite for the [Huub](https://www.joinhuub.com) website, built with **Playwright + TypeScript** using the **Page Object Model (POM)** and object-oriented design. Structured for agentic execution by [Claude Code](https://code.claude.com/docs/).

---

## 1. Purpose

This repository continuously verifies that **https://www.joinhuub.com** — Huub's economic-development SaaS marketing site — loads, navigates, renders, and behaves correctly across desktop, tablet, and mobile.

The suite is **read-only against the live site**. It intentionally:

- ✅ Tests page loads, navigation, layout, forms, and business features.
- ❌ **Never submits forms**, creates accounts, logs in, or enters real credentials or passwords.

The site under test is defined **entirely by [`site.config.json`](./site.config.json)** — URL, feature flags, expected nav items, and viewports. Point that file at a different site and the same framework tests it.

---

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Test runner / browser automation | [Playwright](https://playwright.dev/) |
| Language | TypeScript (strict mode) |
| Design pattern | Page Object Model (POM) + OOP (a `BasePage` superclass all page objects extend) |
| Test data / setup | Custom Playwright fixtures ([`src/fixtures/site.fixture.ts`](./src/fixtures/site.fixture.ts)) |
| CI | GitHub Actions ([`.github/workflows/`](./.github/)) |
| Agentic tooling | Claude Code — subagents, skills, and slash commands under [`.claude/`](./.claude/) |

---

## 3. Test Categories

Every test is tagged. Run a category with its npm script; run everything for a full regression pass.

| Tag | Folder | What it covers | Script |
|-----|--------|----------------|--------|
| `@smoke` | `tests/smoke/` | Site is up, HTTPS, title/meta, no critical console errors, fast load | `npm run test:smoke` |
| `@navigation` | `tests/navigation/` | Nav present, links resolve (no 404s), mobile menu, logo → home | `npm run test:navigation` |
| `@forms` | `tests/forms/` | Form fields, labels, validation — **without submitting** | `npm run test:forms` |
| `@functional` | `tests/functional/` | Business features: product suite, resources, demo CTAs, newsletter, pricing gate | `npm run test:functional` |
| `@visual` | `tests/visual/` | Screenshot regression vs. committed baselines | `npm run test:visual` |
| `@responsive` | `tests/responsive/` | Layout, no horizontal scroll, alt text, viewport meta at each breakpoint | `npm run test:responsive` |

**Smoke vs. functional vs. regression:**
- **Smoke** — the fast gate: "is the site alive and serving a real page?"
- **Functional** — feature-level behavior of the actual product/marketing pages.
- **Regression** — the *whole* suite run together (`npm run test:regression`), including the `@visual` screenshot baselines, to catch anything that changed since the last known-good run.

---

## 4. Getting Started (Development Environment)

### Prerequisites
- **Node.js 18+** (20 LTS recommended)
- **npm** (ships with Node)
- Git

### Setup

```bash
# 1. Clone
git clone <this-repo-url>
cd huub_QA_Agentic_Solution

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (Chromium + mobile/tablet emulation)
npx playwright install --with-deps

# 4. (Optional) create a local env file to override the target URL
cp .env.example .env
#   SITE_URL=https://staging.joinhuub.com   # overrides site.config.json when set
```

### Run the tests

```bash
npm test                  # full suite (all tags, all projects)
npm run test:smoke        # just @smoke
npm run test:functional   # just @functional
npm run test:regression   # full regression pass (alias for the whole suite)
npm run test:headed       # watch it run in a real browser
npm run report            # open the last HTML report
```

### Other useful commands

```bash
npm run typecheck         # tsc --noEmit — must be clean before committing
npm run lint              # ESLint over src/ and tests/
npm run baseline          # refresh @visual screenshot baselines (after intended UI changes)
```

> A `pretest` hook (`.claude/hooks/pre-test.sh`) runs a reachability check against the target site before the suite starts. It only ever **warns** — it never blocks the run — so CI still collects results from a flaky or temporarily down site.

### Browser projects
Playwright runs each test across three projects defined in [`playwright.config.ts`](./playwright.config.ts): `chromium-desktop` (1280×720), `mobile-chrome` (Pixel 5), and `tablet` (iPad Mini).

---

## 5. Project Structure

```
site.config.json            # Site URL, flags, expected nav — the single source of truth
playwright.config.ts        # Projects (desktop/mobile/tablet), reporters, baseURL
global-setup.ts             # One-time reachability check before the suite
tsconfig.json               # Strict TS + @pages/@fixtures/@utils/@app-types path aliases

src/
  pages/                    # Page Object Model — one class per page/section
    base.page.ts            #   BasePage superclass (shared actions; NO assertions)
    home.page.ts
    navigation.page.ts
    contact.page.ts
    product.page.ts         #   marketing/product pages (e.g. Economic Engagement Suite)
    resources.page.ts
  fixtures/
    site.fixture.ts         # Custom `test`/`expect` exposing page objects + siteConfig
  utils/                    # link-checker, visual-helper
  types/                    # SiteConfig interface + loader

tests/
  smoke/  navigation/  forms/  functional/  visual/  responsive/

.claude/                    # Claude Code agentic config (see SKILLS.md / AGENTS.md)
  agents/    commands/    hooks/
.github/                    # CI workflows + contributor & AI-tool instructions (see .github/README.md)
```

---

## 6. Rules for Contributors

These are enforced by [`CLAUDE.md`](./CLAUDE.md) (for AI agents) and code review (for humans). Follow them for every change.

### Architecture
1. **Page Object Model.** Every page/section gets a class in `src/pages/` that **extends `BasePage`**.
2. Locators are `readonly Locator` properties. Methods represent **user actions** — `clickNavItem()`, `fillForm()` — not assertions.
3. **No `expect()` inside page objects.** Assertions live in tests only.
4. Tests import `{ test, expect }` from `@fixtures/site.fixture`, **never** from `@playwright/test` directly.
5. Tests drive the page through its **page object**, not raw `page.locator()` calls in the test body.

### Discipline
6. **Never submit a form, log in, create an account, or enter a password/credentials.** Test presence, structure, and validation only.
7. **Never hardcode the URL** — read `siteConfig.url` (which comes from `site.config.json` / the `SITE_URL` env var).
8. **No `page.waitForTimeout()`** — rely on web-first assertions, auto-waiting, `waitForSelector`, or `waitForLoadState`.
9. **Tag every test** with at least one of `@smoke @navigation @forms @functional @visual @responsive`.
10. TypeScript **strict mode** — everything typed; no unjustified `any`.

### Before you open a PR
```bash
npm run typecheck   # must pass with zero errors
npm run lint        # must be clean
npm test            # (or the relevant tagged subset)
```
- Write real, resilient selectors (prefer roles / semantic attributes over brittle class names).
- Keep tests independent and idempotent.
- Update `site.config.json` if the site's structure changed (nav items, flags).
- If you changed the UI intentionally and `@visual` tests fail, run `npm run baseline` and commit the new snapshots.
- Fill out the PR template ([`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md)).

---

## 7. Working with Claude Code / AI agents

This repo is set up for agentic execution. See:
- **[`CLAUDE.md`](./CLAUDE.md)** — the authoritative instructions Claude Code loads automatically.
- **[`AGENTS.md`](./AGENTS.md)** — the tool-neutral equivalent for any AI coding agent.
- **[`SKILLS.md`](./SKILLS.md)** — the catalog of slash commands and subagents (e.g. `/analyze-site`, `/generate-full-suite`, `/run-smoke`).
- **[`.github/README.md`](./.github/README.md)** — what lives in `.github/` and why (CI, Copilot instructions, path-scoped rules).

---

## 8. Company Profile

| Field | Details |
|-------|---------|
| **Company** | Huub |
| **Product** | Economic development tools for small-business support |
| **Website** | https://www.joinhuub.com |
| **City** | Phoenix, AZ |
| **Founded** | 2020 |
| **Leaders** | Jenny Poon (CEO/Founder), Chelsea Smith (COO) |

---

*Part of the Phoenix Startup QA Agentic Solutions project.*
