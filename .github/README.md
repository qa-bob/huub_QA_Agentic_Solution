# `.github/` — CI, contributor, and AI-tool configuration

This folder holds everything GitHub and AI coding tools read automatically: continuous-integration workflows, contribution templates, and instruction files that steer AI assistants (GitHub Copilot, the Claude GitHub App) toward this repo's conventions.

> **Rule of thumb:** if it configures *GitHub itself* or an assistant *acting through GitHub*, it lives here. If it configures **Claude Code locally**, it lives in [`../.claude/`](../.claude/). Repo-wide instructions for humans/agents live at the root ([`../CLAUDE.md`](../CLAUDE.md), [`../AGENTS.md`](../AGENTS.md), [`../SKILLS.md`](../SKILLS.md)).

---

## What's here

```
.github/
├── README.md                       # this file
├── workflows/
│   ├── playwright.yml               # CI: run the regression suite on push/PR + daily
│   └── claude.yml                   # Claude GitHub App: responds to @claude mentions
├── copilot-instructions.md          # repo-wide GitHub Copilot instructions
├── instructions/                    # path-scoped rules (applied by glob)
│   ├── playwright-tests.instructions.md   # applyTo: tests/**/*.spec.ts
│   └── page-objects.instructions.md       # applyTo: src/pages/**/*.page.ts
├── PULL_REQUEST_TEMPLATE.md         # checklist enforcing the repo's rules
└── ISSUE_TEMPLATE/
    ├── bug_report.md                # test failure / framework bug
    └── test_request.md              # request new coverage
```

---

## The five things and where they go

The question this repo answers: *what Agents, skills, Rules, Instructions, and docs belong in `.github/` vs. elsewhere?*

### 1. Agents
**Definition:** specialized AI sub-assistants with a narrow job (e.g. `site-analyzer`, `test-generator`).

- **Local Claude Code agents:** live in [`../.claude/agents/*.md`](../.claude/agents/) — Markdown with YAML frontmatter (`name`, `description`, `tools`, `model`). Claude Code discovers them automatically. **They do NOT go in `.github/`.**
- **`.github/`'s role for agents:** the `.github/workflows/claude.yml` workflow lets those same agents run *on GitHub* — a contributor mentions `@claude` on an issue/PR and the Claude GitHub App executes, following `CLAUDE.md`/`AGENTS.md`. Requires an `ANTHROPIC_API_KEY` repo secret and the Claude GitHub App installed (`/install-github-app`).

### 2. Skills (slash commands)
**Definition:** reusable, invocable workflows (e.g. `/run-smoke`, `/generate-full-suite`).

- **Local Claude Code skills/commands:** live in [`../.claude/commands/*.md`](../.claude/commands/) (and, for richer skills, `../.claude/skills/<name>/SKILL.md`). Cataloged in [`../SKILLS.md`](../SKILLS.md). **They do NOT go in `.github/`.**
- **`.github/`'s role for skills:** none directly — but a contributor can trigger a skill through the `@claude` workflow (e.g. commenting "@claude run /run-smoke").

### 3. Rules
**Definition:** *path-scoped* constraints — narrower than repo-wide instructions, applied only to files matching a glob.

- **In `.github/`:** [`instructions/*.instructions.md`](./instructions/) files. Each has an `applyTo:` frontmatter glob so GitHub Copilot applies it only to matching files (e.g. `tests/**/*.spec.ts`). This is where "spec files must import from the fixture" and "page objects must extend BasePage" are enforced per-path.
- **Claude Code equivalent:** `../.claude/rules/*.md` (optional; not used here — the same rules are expressed in `CLAUDE.md`/`AGENTS.md`).

### 4. Instructions
**Definition:** *repo-wide* guidance an AI assistant should always follow.

- **In `.github/`:** [`copilot-instructions.md`](./copilot-instructions.md) — GitHub Copilot reads this for every request in this repo.
- **Root equivalents:** [`../CLAUDE.md`](../CLAUDE.md) (Claude Code, loaded automatically) and [`../AGENTS.md`](../AGENTS.md) (tool-neutral). **Keep all three in sync** — they express the same rules for different tools.

### 5. Docs
**Definition:** human-facing documentation and process.

- **In `.github/`:** contribution process — `PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/`, and optionally `CONTRIBUTING.md`, `CODEOWNERS`, `SECURITY.md`, `dependabot.yml`, `FUNDING.yml`.
- **Root docs:** the primary [`../README.md`](../README.md), plus `AGENTS.md` / `SKILLS.md`.

---

## Summary table

| Item | `.github/` | `.claude/` (local) | Repo root |
|------|-----------|--------------------|-----------|
| **Agents** | `workflows/claude.yml` (run via `@claude`) | `agents/*.md` (definitions) | referenced in `AGENTS.md` / `SKILLS.md` |
| **Skills** | — (triggerable via `@claude`) | `commands/*.md`, `skills/*/SKILL.md` | cataloged in `SKILLS.md` |
| **Rules** (path-scoped) | `instructions/*.instructions.md` | `rules/*.md` (optional) | — |
| **Instructions** (repo-wide) | `copilot-instructions.md` | — | `CLAUDE.md`, `AGENTS.md` |
| **Docs** | PR/issue templates, `CONTRIBUTING`, `CODEOWNERS` | — | `README.md` |
| **CI** | `workflows/*.yml` | — | — |

---

## Required repository secrets

For `workflows/claude.yml`:
- **`ANTHROPIC_API_KEY`** — set under *Settings → Secrets and variables → Actions*. Also install the Claude GitHub App (run `/install-github-app` from Claude Code, or install from https://github.com/apps/claude).

`workflows/playwright.yml` needs no secrets — it tests the public site. Add `SITE_URL` as a repo/environment variable only if you want CI to target a non-default (e.g. staging) URL.
