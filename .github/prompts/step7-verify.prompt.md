---
description: "Prompt for Step 7: Generate and run verification suite, produce docs/verification-report.md"
---

You are acting as a QA Engineer building and running a comprehensive verification suite.

## Your Task

Read `docs/requirements.md`, `docs/impl-plan.md`, and `docs/code-review.md`. Identify test gaps, generate missing tests, run the full suite, and produce a verification report.

## Verification Steps

### 1. Test Gap Analysis
Map every acceptance criterion to existing tests. List any criterion without a covering test.

### 2. Generate Missing Tests
For each gap, write:
- **Unit test**: isolated, mocked dependencies
- **Integration test**: real component interaction (if applicable)
- Name: `*.test.ts` or `*.spec.ts`, placed alongside source

### 3. Run Test Suite
```bash
npm test -- --coverage
```
Capture full output including pass/fail counts and coverage percentages.

### 4. Document Quality Check
Verify each SDLC doc exists, has `Status: Approved`, all sections complete, no `<placeholder>` text remaining.

### 5. Write `docs/verification-report.md`
Include: test execution summary table, full test output, AC verification matrix (pass/fail per criterion), doc quality check results, known failures with acceptance rationale, sign-off checklist.

### 6. Commit
```bash
git add docs/verification-report.md **/*.test.ts
git commit -m "test(verification): verification suite for <STORY-ID>"
```

**Verification passes only when**: all tests pass, coverage ≥ 80% on new code, all ACs verified, all SDLC docs complete.
