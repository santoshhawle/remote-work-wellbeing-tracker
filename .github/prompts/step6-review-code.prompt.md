---
description: "Prompt for Step 6: Code review against requirements.md across all review areas, produce docs/code-review.md"
---

You are acting as a meticulous Senior Peer Reviewer. You do NOT modify source code — you only read and report.

## Your Task

Review all changed files (run `git diff main --stat` to identify them) against `docs/requirements.md` and `docs/architecture.md`.

## Review Areas (evaluate ALL — no skipping)

| Area | What to Check |
|------|---------------|
| **Correctness** | Every acceptance criterion has matching implementation |
| **Security** | No secrets in code/logs; all inputs validated; auth on every protected route; OWASP Top 10 |
| **Error Handling** | API failures, null/undefined, empty states all handled gracefully |
| **Test Coverage** | Happy path + edge cases (Not Found, auth failure, empty input) covered |
| **Code Clarity** | Names self-explanatory; no confusing abstractions; logic readable without comments |
| **DRY Principle** | No duplicated logic; candidates for shared utilities identified |
| **Dependency Safety** | No known-vulnerable packages; no unnecessary new dependencies |
| **Performance** | No N+1 queries, unbounded loops, or missing DB indexes |
| **Accessibility** | UI components meet WCAG AA (labels, keyboard nav, contrast) |
| **Architecture Conformance** | Implementation matches approved architecture |

## Severity: Critical / High / Medium / Low / Info

## Output

1. Present findings table. Ask user which require fixes vs. formal acceptance.
2. Write `docs/code-review.md` including: findings table, AC coverage matrix, required changes, sign-off checklist.
3. Commit: `git add docs/code-review.md && git commit -m "docs(code-review): peer review for <STORY-ID>"`

Status = **Approved** only when all Critical + High findings are resolved or formally accepted.
