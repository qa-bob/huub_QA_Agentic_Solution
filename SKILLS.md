# SKILLS.md

Catalog of the **skills (slash commands)** and **subagents** this repo ships for agentic execution with [Claude Code](https://code.claude.com/docs/). These automate the recurring QA tasks so a human (or an agent) can drive the suite with a single command.

> **Where they live:** slash commands are Markdown files in [`.claude/commands/`](./.claude/commands/); subagents are Markdown files with YAML frontmatter in [`.claude/agents/`](./.claude/agents/). Claude Code discovers both automatically. Other tools can read these files as documentation of the intended workflow.

---

## Slash commands (skills)

Invoke by typing the command in Claude Code (e.g. `/run-smoke`).

| Command | What it does | When to use |
|---------|--------------|-------------|
| `/analyze-site` | Inspects the live site's structure and reports pages, nav, forms, and key elements. | Onboarding a site, or auditing structure before writing selectors. |
| `/generate-full-suite` | Analyzes the site and generates a complete POM + tests across all six categories, then updates `site.config.json`. | First-time suite generation or a major re-build. |
| `/run-smoke` | Runs `@smoke` tests and prints a clean pass/fail summary with suggested fixes. | Fast health check of the target site. |
| `/update-baseline` | Refreshes the `@visual` screenshot baselines. | After an **intended** UI change makes visual tests fail. |
| `/generate-report` | Produces a human-readable summary of the latest test results. | Sharing results with stakeholders. |

### Typical flow

```
/analyze-site            # understand the site → confirm site.config.json
/generate-full-suite     # build/refresh page objects + tests
/run-smoke               # verify the target is healthy
npm test                 # full regression pass
/generate-report         # summarize for stakeholders
```

---

## Subagents

Specialized agents in [`.claude/agents/`](./.claude/agents/). Each has YAML frontmatter (`name`, `description`, `tools`, `model`) so Claude Code loads it as a delegatable subagent, and a body describing its exact procedure, inputs, outputs, and edge cases.

| Agent | Role | Inputs | Output |
|-------|------|--------|--------|
| **site-analyzer** | Crawls a live website and produces a fully populated `site.config.json`. Resolves redirects, dismisses cookie banners, extracts nav items, detects forms and auth-gating. | `url` (required), `companyName` (optional) | Valid `site.config.json` + an issues checklist + a confidence rating. |
| **test-generator** | Reads a populated `site.config.json` and generates site-specific specs and supporting page objects that go beyond the generic suites. | `siteConfig` (required), `testScenarios`, `pagesToTest` | New `tests/**` specs + `src/pages/**` classes following repo conventions. |

### How commands and agents relate
- **Commands** are the entry points a user types.
- Behind a command like `/generate-full-suite`, an agent (e.g. **test-generator**) may do the heavy lifting in an isolated context.
- Both obey the rules in [`AGENTS.md`](./AGENTS.md) / [`CLAUDE.md`](./CLAUDE.md): POM architecture, no form submission, no hardcoded URLs, strict TypeScript.

---

## Adding a new skill or agent

**New slash command:** add `.claude/commands/<name>.md`. The file body is the prompt/procedure Claude runs when the command is invoked. Keep it focused on one task.

**New subagent:** add `.claude/agents/<name>.md` with frontmatter:

```markdown
---
name: my-agent
description: One line on what it does and WHEN Claude should delegate to it.
tools: Read, Write, Edit, Bash, WebFetch, Grep, Glob
model: sonnet
---

# Agent: my-agent
...role, inputs, step-by-step procedure, edge cases, output format...
```

Only `name` and `description` are required; `tools` and `model` are recommended so the agent runs with least privilege. After adding, restart Claude Code (or reload) so it's discovered — verify it appears in the agent list.
