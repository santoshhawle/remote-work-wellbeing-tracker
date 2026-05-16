---
applyTo: "docs/**"
---

# SDLC Document Authoring Conventions

These rules apply whenever GitHub Copilot reads or writes any file under `docs/`.

## Required Header

Every SDLC document **must** begin with this header block (no exceptions):

```markdown
# <Document Title>

**Story ID:** <Jira ID, e.g. KAN-1>
**Date:** <YYYY-MM-DD>
**Author:** <Agent name, e.g. Architecture Designer>
**Status:** <Draft | In Review | Approved | Superseded>
```

## Status Lifecycle

Valid status transitions (never skip or reverse):

```
Draft → In Review → Approved → Superseded
```

- `Draft` — initial output from an agent, not yet reviewed
- `In Review` — presented to user, awaiting decision
- `Approved` — user has explicitly approved ("approved", "yes", "proceed", or "LGTM")
- `Superseded` — replaced by a newer version; never delete the old file

## Document Versioning Rules

- **Never delete** an existing document.
- When a document needs replacing, update its `Status` to `Superseded` and create a new file (e.g. `architecture-v2.md`).
- The new document must reference the superseded one: `Supersedes: docs/architecture.md`.

## No Placeholder Text

Documents with `Status: Approved` must contain **no** unresolved placeholder text:
- No `<...>` tokens
- No `TODO` or `FIXME` comments
- No `[INSERT ...]` stubs

## Story ID Format

Story IDs must follow the Jira key format: `[A-Z]+-[0-9]+` (e.g. `KAN-1`, `PROJ-42`).

## Document Index

| File | Owner Agent | Purpose |
|------|-------------|---------|
| `requirements.md` | Jira Requirements Capture | Functional + non-functional requirements |
| `architecture.md` | Architecture Designer | System design and tech stack |
| `design-review.md` | Design Reviewer | Risk analysis of architecture |
| `impl-plan.md` | Implementation Planner | Tasked implementation breakdown |
| `code-review.md` | Code Reviewer | Pre-PR code quality findings |
| `verification-report.md` | Verification Suite | Test results and coverage |
