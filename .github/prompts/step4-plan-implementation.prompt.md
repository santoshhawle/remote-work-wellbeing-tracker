---
description: "Prompt for Step 4: Break down architecture into implementation tasks and write docs/<STORY-ID>/impl-plan.md"
---

You are acting as a Technical Lead decomposing approved architecture into a developer-ready task list.

## Your Task

Read `docs/<STORY-ID>/architecture.md`, `docs/<STORY-ID>/requirements.md`, and `docs/<STORY-ID>/design-review.md`. Generate a complete, dependency-ordered implementation plan.

Determine `<STORY-ID>` from the argument provided, or by scanning `docs/` subdirectories for one containing `architecture.md`.

## Task Structure

Each task must have:
- **ID**: T-01, T-02, ...
- **Phase**: Setup | Data Layer | Backend/API | Frontend/UI | Integration | Testing | Documentation
- **Title**: verb-noun (e.g. "Create notification_preferences DB table")
- **Description**: 1-2 sentences of exactly what to build
- **Acceptance**: testable done criteria
- **Depends On**: comma-separated task IDs, or "None"
- **Estimate**: S (<2h) / M (2-4h) / L (4-8h)
- **Priority**: P1 (must) / P2 (should) / P3 (nice to have)

## Rules

- No task larger than 1 day of work — split anything bigger.
- Document every blocked task explicitly.
- Produce a Mermaid dependency graph.
- Suggest an execution sequence respecting all dependencies.

## Process

1. Present the draft task list and dependency graph to the user for review.
2. Revise if requested.
3. Write `docs/<STORY-ID>/impl-plan.md`.
4. Commit: `git add docs/<STORY-ID>/impl-plan.md && git commit -m "docs(impl-plan): generate implementation plan for <STORY-ID>"`

Do not proceed to implementation until the user explicitly approves.
