# Code Review: Export Wellbeing Logs as CSV

**Story ID:** KAN-2
**Date:** 2026-05-18
**Author:** Code Reviewer
**Status:** Approved

---

## 1. Scope

Files reviewed against `docs/requirements.md` and `docs/architecture.md`.

| File | Type |
|------|------|
| `server/src/utils/csvSerialize.ts` | New — CSV serialization helper |
| `server/src/__tests__/csvSerialize.test.ts` | New — unit tests |
| `server/src/routes/logs.ts` | Modified — export route added |
| `server/src/__tests__/logsExport.test.ts` | New — integration tests |
| `client/src/api.ts` | Modified — `exportCsv` method added |
| `client/src/__tests__/api.test.ts` | New — unit tests |
| `client/src/components/ExportControls.tsx` | New — export UI component |
| `client/src/components/__tests__/ExportControls.test.tsx` | New — component tests |
| `client/src/pages/DashboardPage.tsx` | Modified — `<ExportControls />` mounted |

---

## 2. Findings Table

| # | Area | Finding | Severity | Resolution |
|---|------|---------|----------|------------|
| F-1 | Correctness | Date regex `^\d{4}-\d{2}-\d{2}$` validated format only — semantically invalid dates (e.g. `2026-13-45`) would pass and silently return 0 rows | Low | **Fixed** — `isCalendarDate()` helper added; 400 returned for invalid calendar dates |
| F-2 | Error Handling | `ExportControls` passed `{ start: '', end: '' }` to the server when custom preset selected with empty date inputs; server returned 400 but error was generic | Low | **Fixed** — empty-date guard added to `handleExport`; clear client-side error message shown before any network call |
| F-3 | Accessibility | Export button `aria-label` is static during loading — screen readers do not announce the "Exporting…" state | Low | **Accepted** — `aria-busy` attribute noted as enhancement; existing `disabled` state conveys unavailability |
| F-4 | DRY | `days` clamping pattern duplicated between `/export` and `/` route handlers (pre-existing) | Info | **Accepted** — pre-existing pattern, out of scope for this story |
| F-5 | Architecture Conformance | Component diagram shows `JOIN users` but implementation correctly uses JWT payload (no JOIN); diagram arrow not updated | Info | **Accepted** — implementation is the correct, reviewed decision (F-9); diagram reflects initial draft |
| F-6 | Architecture Conformance | Architecture diagram shows `BlobDownloader` as a separate box; blob logic is inline in `api.ts` | Info | **Accepted** — cleaner, no separate abstraction needed for a single-consumer utility |
| F-7 | Test Coverage | No test for `ExportControls` with custom preset and empty date inputs | Low | **Fixed** — new test added as part of F-2 fix |

---

## 3. Acceptance Criteria Coverage Matrix

| AC | Description | Implementation | Tests | Status |
|----|-------------|----------------|-------|--------|
| AC-1 | Clicking Export downloads a `.csv` file | `ExportControls` → `api.logs.exportCsv` → `<a download>` click | `api.test.ts` — blob download path | ✅ |
| AC-2 | CSV contains header row `date,mood,energy,focus,notes,work_hours,name,email` | `CSV_HEADERS` constant in `logs.ts`; `csvSerialize` prepends header | `logsExport.test.ts` — header row assertion | ✅ |
| AC-3 | Rows match only the date range for the authenticated user | `WHERE user_id = ? AND date >= ? AND date <= ?` in SQL | `logsExport.test.ts` — date range + user isolation tests | ✅ |
| AC-4 | Custom date range filters records correctly | `?start=&end=` query params validated and passed to SQL | `logsExport.test.ts` — custom range test; `ExportControls.test.tsx` — start/end call | ✅ |
| AC-5 | No logs → headers-only CSV, no error | `csvSerialize` returns BOM + header when `rows` is empty | `logsExport.test.ts` — empty range test | ✅ |
| AC-6 | No token → HTTP 401 | `router.use(authenticate)` before all routes | `logsExport.test.ts` — 401 test | ✅ |
| AC-7 | No cross-user data in export | `WHERE user_id = req.user!.id` — identity from JWT only | `logsExport.test.ts` — user isolation test | ✅ |

---

## 4. Security Review

| Concern | Finding |
|---------|---------|
| Authentication | `authenticate` middleware applied to entire router; no route is reachable without a valid JWT ✅ |
| Authorization / data isolation | `WHERE user_id = req.user!.id` — user ID always from verified JWT payload, never from query params ✅ |
| SQL injection | Parameterised queries via `db.prepare(...).all(userId, startDate, endDate)` — no string interpolation ✅ |
| CSV injection | Fields starting with `=+-@` prefixed with `\t` in `encodeField()` ✅ |
| Token exposure | JWT sent in `Authorization: Bearer` header only — never in URL ✅ |
| Input validation | `days` clamped to [1, 365]; `start`/`end` validated by regex + calendar check; `start ≤ end` enforced ✅ |
| Error leakage | Stack traces never forwarded to client; server logs to `process.stderr` only ✅ |
| Secrets | `JWT_SECRET` from `process.env`; no new secrets introduced ✅ |
| `console.log` in production | None found ✅ |

---

## 5. Test Coverage Summary

| Suite | File | Tests | Result |
|-------|------|-------|--------|
| Server — CSV serializer | `csvSerialize.test.ts` | 10 | ✅ All pass |
| Server — export route | `logsExport.test.ts` | 10 | ✅ All pass |
| Client — api.logs.exportCsv | `api.test.ts` | 8 | ✅ All pass |
| Client — ExportControls | `ExportControls.test.tsx` | 12 | ✅ All pass |
| **Total** | | **40 new / 99 total** | ✅ |

---

## 6. Required Changes

All required changes have been applied:

- [x] **F-1 fixed** — `isCalendarDate()` semantic validation added to `server/src/routes/logs.ts`
- [x] **F-2 fixed** — empty custom date guard added to `client/src/components/ExportControls.tsx`
- [x] **F-7 fixed** — test for empty custom dates added to `ExportControls.test.tsx`

---

## 7. Sign-Off Checklist

- [x] All Critical findings resolved or accepted: N/A (none found)
- [x] All High findings resolved or accepted: N/A (none found)
- [x] All Low findings resolved, deferred, or formally accepted
- [x] All 7 Acceptance Criteria (AC-1 → AC-7) verified implemented and tested
- [x] TypeScript builds clean (client and server)
- [x] No `console.log` or debug statements in production code
- [x] No secrets or credentials in committed files
- [x] 99 tests passing (20 server + 79 client)
- [x] OWASP Top 10 risks assessed — no vulnerabilities found

**Status: Approved** — implementation is ready to proceed to Step 7 (Verification Suite).
