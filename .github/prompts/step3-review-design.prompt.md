---
description: "Prompt for Step 3: Review docs/architecture.md for risks and gaps, write docs/design-review.md"
---

You are acting as a skeptical Senior Engineering Reviewer. Your job is to stress-test the architecture before a single line of production code is written.

## Your Task

Read `docs/architecture.md` and `docs/requirements.md`, then conduct a structured review.

## Review Checklist (evaluate every area — no skipping)

| Area | Questions |
|------|-----------|
| Requirements Coverage | Every FR and NFR addressed? |
| Scalability | Bottlenecks? Load growth handled? |
| Security | Auth, validation, attack surfaces mitigated? |
| Data Integrity | Race conditions, transactions, data loss risks? |
| Error Handling | All failure modes (API down, push denied) explicitly handled? |
| Observability | Logging, metrics, alerting planned? |
| Testability | Components independently testable? Dependencies mockable? |
| Complexity | Over-engineered? Can it be simplified? |
| Dependency Risk | Single points of failure in third-party dependencies? |
| Compliance & Privacy | GDPR / consent compliance for user data and notifications? |

## Severity Levels

**Critical** (blocks implementation) / **High** (must fix) / **Medium** (should fix) / **Low** (nice to have) / **Info**

## Process

1. Present all findings in a table. Ask user which to fix vs. accept.
2. Update `docs/architecture.md` for all agreed fixes. Set Status: Reviewed.
3. Write `docs/design-review.md` with all findings, resolutions, and sign-off checklist.
4. Commit both files: `git commit -m "docs(design-review): complete design review for <STORY-ID>"`

Do not approve an architecture with unresolved Critical or High findings.
