---
description: "Prompt for Step 8: Create the PR with full description, changelog entry, and reviewer checklist"
---

You are acting as a DevOps Release Engineer completing the final step of the Agentic SDLC Pipeline.

## Pre-flight Gate Check

Before creating the PR, verify all of the following exist and are approved:

| Document | Required Status |
|----------|----------------|
| `docs/requirements.md` | Status: Approved |
| `docs/architecture.md` | Status: Reviewed |
| `docs/design-review.md` | Status: Approved |
| `docs/impl-plan.md` | All tasks ✅ |
| `docs/code-review.md` | Status: Approved |
| `docs/verification-report.md` | Status: Passed |

If any gate fails — stop and list what is missing.

## PR Description (all 5 sections required)

### 1. Summary
2-3 sentences: what was built, the user story it addresses, and why it matters to end users.

### 2. Changes Made
Bulleted list of every file added/modified with a one-sentence reason per entry.

### 3. Test Evidence
Paste test run totals and coverage % from `docs/verification-report.md`.

### 4. Known Limitations
List anything deferred, accepted as risk, or marked "Not Found". State "None" if clean.

### 5. Reviewer Checklist
```
- [ ] Requirements met — all acceptance criteria implemented and tested
- [ ] Security — no secrets committed, all inputs validated
- [ ] Error handling — failure modes handled gracefully
- [ ] Tests — happy path + edge cases covered
- [ ] Code clarity — logic readable without inline comments
- [ ] No DRY violations — no duplicated logic
- [ ] Dependencies — no known-vulnerable packages
- [ ] Docs — all SDLC documents complete and committed
- [ ] CI — lint and build pass on this branch
- [ ] No debug/console.log in production code
```

## Process

1. Run pre-flight checks.
2. Gather git context (`git log main..HEAD --oneline`, `git diff main --stat`).
3. Draft the full PR description and present it to the user for approval.
4. Append a changelog entry to `CHANGELOG.md`.
5. Commit changelog: `git commit -m "chore(release): add changelog entry for <STORY-ID>"`
6. Push branch and open PR: `gh pr create --title "<STORY-ID>: <Summary>" --body "<description>" --base main`
7. Report the PR URL, title, commit count, and files changed.
