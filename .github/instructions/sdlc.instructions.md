---
applyTo: "**"
---

# Agentic SDLC Pipeline — Global Conventions

These conventions apply to all GitHub Copilot interactions in this repository.

## Pipeline Overview

This project follows an 8-step Agentic SDLC Pipeline, each step owned by a dedicated agent:

| Step | Agent | Output File |
|------|-------|-------------|
| 1 — Requirements | `Jira Requirements Capture` | `docs/<STORY-ID>/requirements.md` |
| 2 — Architecture | `Architecture Designer` | `docs/<STORY-ID>/architecture.md` |
| 3 — Design Review | `Design Reviewer` | `docs/<STORY-ID>/design-review.md` |
| 4 — Implementation Plan | `Implementation Planner` | `docs/<STORY-ID>/impl-plan.md` |
| 5 — Implementation | `Code Implementer` | source code |
| 6 — Code Review | `Code Reviewer` | `docs/<STORY-ID>/code-review.md` |
| 7 — Verification | `Verification Suite` | `docs/<STORY-ID>/verification-report.md` |
| 8 — PR | `PR Creator` | Pull Request |

## Document Conventions

- All SDLC documents live under `docs/<STORY-ID>/` (e.g. `docs/KAN-1/requirements.md`).
- The `<STORY-ID>` directory is created by the Jira Requirements Capture agent at Step 1.
- Every document must include a header with: **Story ID**, **Date**, **Author (agent name)**, **Status**.
- Statuses: `Draft` → `In Review` → `Approved` → `Superseded`.
- Never delete a document — update its status to `Superseded` and create a new version.

## Commit Message Format

```
<type>(<scope>): <short description>

Types: feat, fix, docs, test, refactor, chore
Scope: matches the step, e.g. requirements, architecture, impl-plan, tests, pr
```

Examples:
- `docs(requirements): capture requirements for KAN-1`
- `docs(architecture): propose architecture for KAN-1`
- `test(verification): add unit tests for notification scheduler`

## Code Quality Standards

- No secrets, tokens, or credentials in any committed file.
- All user inputs must be validated at system boundaries.
- Every new function must have at least one test (happy path + one edge case).
- No `console.log` or debug statements in production code.
- Linting must pass before any commit.

## Gate Rules (Human-in-the-Loop)

Each step **requires explicit user approval** before the next step begins:
- User must type "approved", "yes", "proceed", or "LGTM" to advance.
- Any other response triggers a revision loop within the same step.
- No agent may skip to the next step autonomously.
